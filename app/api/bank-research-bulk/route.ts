import { getRequestEmail } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureBankResearch } from '../../lib/directories';
import { researchIdentity } from '../../lib/research-access';

const OWNER = ADMIN_OWNER;
const clean = (value: unknown, max = 10000) =>
  String(value ?? '')
    .trim()
    .slice(0, max);
const emailOf = async (request: Request) => await getRequestEmail(request);

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  const identity = await researchIdentity(request, env.DB),
    email = identity?.email || '';
  if (!email)
    return Response.json(
      { error: 'Research access is required.' },
      { status: 401 },
    );
  const allowed =
    email === OWNER ||
    Boolean(
      await env.DB.prepare(
        'SELECT email FROM bank_researchers WHERE email=? AND active=1',
      )
        .bind(email)
        .first(),
    );
  if (!allowed)
    return Response.json(
      { error: 'Your account is not approved for bank research.' },
      { status: 403 },
    );
  const body = (await request.json()) as {
    rows?: Array<Record<string, unknown>>;
  };
  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 1000) : [];
  if (!rows.length)
    return Response.json(
      { error: 'No lender rows were found.' },
      { status: 400 },
    );
  const now = new Date().toISOString(),
    statements = [];
  for (const row of rows) {
    const title = clean(row.title, 250),
      type = clean(row.institution_type, 150);
    if (!title || !type) continue;
    const id = crypto.randomUUID(),
      reference = `KH-BR-${id.slice(0, 8).toUpperCase()}`;
    statements.push(
      env.DB.prepare(
        'INSERT INTO bank_research_submissions(id,reference,researcher_email,researcher_name,title,institution_type,status_recommendation,website,summary,public_comment,last_updated,full_report,source_urls,ownership_details,iska_details,internal_notes,workflow_status,created_at,updated_at,submitted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      ).bind(
        id,
        reference,
        email,
        clean(row.researcher_name, 200) || email,
        title,
        type,
        clean(row.status_recommendation, 60) || 'lack-of-information',
        clean(row.website, 1000),
        clean(row.summary, 5000),
        clean(row.public_comment, 3000),
        clean(row.last_updated, 10),
        clean(row.full_report, 30000),
        clean(row.source_urls, 10000),
        clean(row.ownership_details, 10000),
        clean(row.iska_details, 10000),
        clean(row.internal_notes, 10000),
        'Draft',
        now,
        now,
        '',
      ),
    );
  }
  if (!statements.length)
    return Response.json(
      { error: 'Every row is missing a bank name or institution type.' },
      { status: 400 },
    );
  for (let index = 0; index < statements.length; index += 50)
    await env.DB.batch(statements.slice(index, index + 50));
  return Response.json({
    imported: statements.length,
    skipped: rows.length - statements.length,
  });
}
