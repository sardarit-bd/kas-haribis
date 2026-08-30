import { ADMIN_OWNER } from '../../lib/admin-access';
import { getRequestEmail } from '../../lib/request-auth';
import { ensureBankResearch, ensureBanks } from '../../lib/directories';
import { researchIdentity } from '../../lib/research-access';
const OWNER = ADMIN_OWNER.toLowerCase();
const clean = (v: unknown, n = 10000) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
const emailOf = async (r: Request) => (await getRequestEmail(r)).toLowerCase();
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  return env;
}
async function permitted(db: any, email: string) {
  if (email === OWNER) return true;
  return Boolean(
    await db
      .prepare('SELECT email FROM bank_researchers WHERE email=? AND active=1')
      .bind(email)
      .first(),
  );
}
async function canReview(db: any, email: string) {
  if (email === OWNER) return true;
  return Boolean(
    await db
      .prepare(
        'SELECT email FROM bank_research_reviewers WHERE email=? AND active=1',
      )
      .bind(email)
      .first(),
  );
}
const fields = (b: any) => [
  clean(b.title, 250),
  clean(b.institution_type, 150),
  clean(b.status_recommendation, 60) || 'lack-of-information',
  clean(b.website, 1000),
  clean(b.summary, 5000),
  clean(b.public_comment, 3000),
  clean(b.last_updated, 10),
  clean(b.full_report, 30000),
  clean(b.source_urls, 10000),
  clean(b.ownership_details, 10000),
  clean(b.iska_details, 10000),
  clean(b.internal_notes, 10000),
];
export async function GET(request: Request) {
  const env = await runtime(),
    identity = await researchIdentity(request, env.DB),
    email = identity?.email || (await emailOf(request));
  if (!email)
    return Response.json(
      { error: 'Research access is required.' },
      { status: 401 },
    );
  const reviewer = await canReview(env.DB, email),
    researcher = Boolean(identity) && (await permitted(env.DB, email));
  if (!reviewer && !researcher)
    return Response.json(
      { error: 'Your account is not approved for bank research.' },
      { status: 403 },
    );
  const seeAll = email === OWNER || reviewer,
    query = seeAll
      ? 'SELECT * FROM bank_research_submissions ORDER BY updated_at DESC'
      : 'SELECT * FROM bank_research_submissions WHERE researcher_email=? ORDER BY updated_at DESC';
  const result = seeAll
    ? await env.DB.prepare(query).all()
    : await env.DB.prepare(query).bind(email).all();
  return Response.json({
    submissions: result.results,
    owner: email === OWNER,
    reviewer,
  });
}
export async function POST(request: Request) {
  const env = await runtime(),
    identity = await researchIdentity(request, env.DB),
    email = identity?.email || '';
  if (!email)
    return Response.json(
      { error: 'Research access is required.' },
      { status: 401 },
    );
  if (!(await permitted(env.DB, email)))
    return Response.json(
      { error: 'Your account is not approved for the research portal.' },
      { status: 403 },
    );
  const b = (await request.json()) as any,
    [
      title,
      type,
      status,
      website,
      summary,
      comment,
      lastUpdated,
      fullReport,
      sources,
      ownership,
      iska,
      notes,
    ] = fields(b);
  if (!title || !type)
    return Response.json(
      { error: 'Enter the lender name and institution type.' },
      { status: 400 },
    );
  if (lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated))
    return Response.json(
      { error: 'Enter a valid research date.' },
      { status: 400 },
    );
  const now = new Date().toISOString(),
    id = clean(b.id, 100),
    submit = Boolean(b.submit);
  if (id) {
    const row = (await env.DB.prepare(
      'SELECT researcher_email,workflow_status FROM bank_research_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
    if (!row || (email !== OWNER && row.researcher_email !== email))
      return Response.json(
        { error: 'Research record not found.' },
        { status: 404 },
      );
    if (
      email !== OWNER &&
      ['Approved', 'Rejected'].includes(row.workflow_status)
    )
      return Response.json(
        { error: 'This reviewed record can no longer be changed.' },
        { status: 409 },
      );
    await env.DB.prepare(
      'UPDATE bank_research_submissions SET title=?,institution_type=?,status_recommendation=?,website=?,summary=?,public_comment=?,last_updated=?,full_report=?,source_urls=?,ownership_details=?,iska_details=?,internal_notes=?,workflow_status=?,submitted_at=?,updated_at=? WHERE id=?',
    )
      .bind(
        title,
        type,
        status,
        website,
        summary,
        comment,
        lastUpdated,
        fullReport,
        sources,
        ownership,
        iska,
        notes,
        submit ? 'Submitted' : 'Draft',
        submit ? now : '',
        now,
        id,
      )
      .run();
    return Response.json({ saved: true, id, submitted: submit });
  }
  const newId = crypto.randomUUID(),
    reference = `KH-BR-${newId.slice(0, 8).toUpperCase()}`;
  await env.DB.prepare(
    'INSERT INTO bank_research_submissions(id,reference,researcher_email,researcher_name,title,institution_type,status_recommendation,website,summary,public_comment,last_updated,full_report,source_urls,ownership_details,iska_details,internal_notes,workflow_status,created_at,updated_at,submitted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      newId,
      reference,
      email,
      clean(b.researcher_name, 200) || email,
      title,
      type,
      status,
      website,
      summary,
      comment,
      lastUpdated,
      fullReport,
      sources,
      ownership,
      iska,
      notes,
      submit ? 'Submitted' : 'Draft',
      now,
      now,
      submit ? now : '',
    )
    .run();
  return Response.json({
    saved: true,
    id: newId,
    reference,
    submitted: submit,
  });
}
export async function PUT(request: Request) {
  const email = await emailOf(request),
    env = await runtime();
  if (!(await canReview(env.DB, email)))
    return Response.json(
      { error: 'Your account does not have research review access.' },
      { status: 403 },
    );
  const b = (await request.json()) as any,
    id = clean(b.id, 100),
    action = clean(b.action, 50),
    reviewNotes = clean(b.review_notes, 10000),
    reviewerName = clean(b.reviewer_name, 200) || email,
    row = (await env.DB.prepare(
      'SELECT * FROM bank_research_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (!row)
    return Response.json(
      { error: 'Research record not found.' },
      { status: 404 },
    );
  const now = new Date().toISOString();
  if (action === 'request_changes') {
    await env.DB.prepare(
      "UPDATE bank_research_submissions SET workflow_status='Changes requested',review_notes=?,reviewer_email=?,reviewer_name=?,reviewed_at=?,updated_at=? WHERE id=?",
    )
      .bind(reviewNotes, email, reviewerName, now, now, id)
      .run();
    return Response.json({ saved: true, status: 'Changes requested' });
  }
  if (action === 'reviewer_approve') {
    if (email === OWNER)
      return Response.json(
        { error: 'Use Approve & publish for final owner approval.' },
        { status: 400 },
      );
    await env.DB.prepare(
      "UPDATE bank_research_submissions SET workflow_status='Reviewer approved',review_notes=?,reviewer_email=?,reviewer_name=?,reviewed_at=?,updated_at=? WHERE id=?",
    )
      .bind(reviewNotes, email, reviewerName, now, now, id)
      .run();
    return Response.json({ saved: true, status: 'Reviewer approved' });
  }
  if (action === 'reject') {
    if (email !== OWNER)
      return Response.json(
        { error: 'Only the owner can reject a record.' },
        { status: 403 },
      );
    await env.DB.prepare(
      "UPDATE bank_research_submissions SET workflow_status='Rejected',review_notes=?,reviewer_email=?,reviewer_name=?,reviewed_at=?,updated_at=? WHERE id=?",
    )
      .bind(reviewNotes, email, reviewerName, now, now, id)
      .run();
    return Response.json({ saved: true, status: 'Rejected' });
  }
  if (action !== 'approve')
    return Response.json({ error: 'Choose a review action.' }, { status: 400 });
  if (email !== OWNER)
    return Response.json(
      { error: 'Only the Kav Haribis owner can publish research live.' },
      { status: 403 },
    );
  await ensureBanks(env.DB);
  const bankId = row.published_bank_id || crypto.randomUUID(),
    logoUrl = row.logo_key
      ? `/api/bank-research-file?id=${encodeURIComponent(id)}&kind=logo`
      : '',
    existing = await env.DB.prepare('SELECT id FROM banks WHERE id=?')
      .bind(bankId)
      .first();
  if (existing)
    await env.DB.prepare(
      'UPDATE banks SET title=?,status=?,summary=?,comment=?,last_updated=?,full_report=?,institution_type=?,website=?,logo_url=?,researcher=?,source_urls=?,ownership_details=?,iska_details=?,internal_notes=? WHERE id=?',
    )
      .bind(
        row.title,
        row.status_recommendation,
        row.summary,
        row.public_comment,
        row.last_updated,
        row.full_report,
        row.institution_type,
        row.website,
        logoUrl,
        row.researcher_name || row.researcher_email,
        row.source_urls,
        row.ownership_details,
        row.iska_details,
        row.internal_notes,
        bankId,
      )
      .run();
  else {
    const max = (await env.DB.prepare(
      'SELECT MAX(sort_order) AS value FROM banks',
    ).first()) as any;
    await env.DB.prepare(
      'INSERT INTO banks(id,title,status,summary,comment,last_updated,full_report,institution_type,website,logo_url,researcher,source_urls,ownership_details,iska_details,internal_notes,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    )
      .bind(
        bankId,
        row.title,
        row.status_recommendation,
        row.summary,
        row.public_comment,
        row.last_updated,
        row.full_report,
        row.institution_type,
        row.website,
        logoUrl,
        row.researcher_name || row.researcher_email,
        row.source_urls,
        row.ownership_details,
        row.iska_details,
        row.internal_notes,
        Number(max?.value || 0) + 1,
        now,
      )
      .run();
  }
  await env.DB.prepare(
    "UPDATE bank_research_submissions SET workflow_status='Approved',review_notes=?,reviewer_email=?,reviewer_name=?,reviewed_at=?,published_bank_id=?,approved_at=?,updated_at=? WHERE id=?",
  )
    .bind(reviewNotes, email, reviewerName, now, bankId, now, now, id)
    .run();
  return Response.json({
    saved: true,
    status: 'Approved',
    bankId,
    published: true,
  });
}
