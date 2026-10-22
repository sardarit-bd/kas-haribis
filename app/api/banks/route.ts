import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { canAccessSection } from '../../lib/admin-access';
import { ensureBanks, listBanks, listBanksAdmin } from '../../lib/directories';
import { isHtmlReport, sanitizeReportHtml } from '../../lib/report-sanitizer';

const clean = (v: unknown, n: number) =>
  String(v || '')
    .trim()
    .slice(0, n);

async function env() {
  return (await import('cloudflare:workers')).env;
}

export async function GET(request: Request) {
  const runtime = await env();
  const email = await getRequestEmail(request);
  const authorized = await canAccessSection(runtime.DB, email, 'banks');
  return Response.json({
    banks: authorized
      ? await listBanksAdmin(runtime.DB)
      : await listBanks(runtime.DB),
  });
}

export async function POST(request: Request) {
  const runtime = await env();
  const email = await getRequestEmail(request);
  if (!(await canAccessSection(runtime.DB, email, 'banks')))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureBanks(runtime.DB);
  const body = (await request.json()) as any;
  const title = clean(body.title, 200),
    status = clean(body.status, 60),
    summary = clean(body.summary, 3000),
    comment = clean(body.comment, 2000),
    lastUpdated = clean(body.last_updated, 10);

  let fullReport = '';
  if (body.full_report !== undefined) {
    if (typeof body.full_report !== 'string') {
      return Response.json({ error: 'Invalid report content.' }, { status: 400 });
    }
    const rawReport = String(body.full_report || '').trim();
    fullReport = isHtmlReport(rawReport) ? sanitizeReportHtml(rawReport) : rawReport;
    if (fullReport.length > 512000) {
      return Response.json(
        { error: 'Report content exceeds the maximum size limit of 500 KB. Please reduce text length or use the attached PDF.' },
        { status: 413 },
      );
    }
  }

  if (!title || !status)
    return Response.json(
      { error: 'Enter a name and status.' },
      { status: 400 },
    );

  if (lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated))
    return Response.json(
      { error: 'Enter a valid last-updated date.' },
      { status: 400 },
    );

  const duplicate = (await runtime.DB.prepare(
    'SELECT id, title FROM banks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?))',
  )
    .bind(title)
    .first()) as { id: string; title: string } | null;

  if (duplicate) {
    return Response.json(
      {
        error: `A bank named "${duplicate.title}" already exists. Please edit the existing entry instead of creating a duplicate.`,
        existingId: duplicate.id,
      },
      { status: 409 },
    );
  }

  const clientAssignedId = clean(body.id, 80);
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientAssignedId);
  const id = isValidUuid ? clientAssignedId : crypto.randomUUID();

  const idCollision = await runtime.DB.prepare('SELECT id FROM banks WHERE id = ?').bind(id).first();
  if (idCollision) {
    return Response.json(
      { error: 'A bank entry with this identifier already exists.' },
      { status: 409 },
    );
  }

  const max = (await runtime.DB.prepare(
    'SELECT MAX(sort_order) AS value FROM banks',
  ).first()) as any;

  const reportPdfKey = clean(body.report_pdf_key, 250);
  const reportPdfName = clean(body.report_pdf_name, 250);

  await runtime.DB.prepare(
    'INSERT INTO banks(id,title,status,summary,comment,last_updated,full_report,institution_type,website,logo_url,researcher,source_urls,ownership_details,iska_details,internal_notes,sort_order,created_at,report_pdf_key,report_pdf_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      id,
      title,
      status,
      summary,
      comment,
      lastUpdated,
      fullReport,
      clean(body.institution_type, 150),
      clean(body.website, 1000),
      clean(body.logo_url, 1000),
      clean(body.researcher, 250),
      clean(body.source_urls, 10000),
      clean(body.ownership_details, 10000),
      clean(body.iska_details, 10000),
      clean(body.internal_notes, 10000),
      Number(max?.value || 0) + 1,
      new Date().toISOString(),
      reportPdfKey,
      reportPdfName,
    )
    .run();

  return Response.json({ saved: true, id });
}

export async function PUT(request: Request) {
  const runtime = await env();
  const email = await getRequestEmail(request);
  if (!(await canAccessSection(runtime.DB, email, 'banks')))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureBanks(runtime.DB);
  const body = (await request.json()) as any;
  const id = clean(body.id, 80),
    title = clean(body.title, 200),
    status = clean(body.status, 60),
    lastUpdated = clean(body.last_updated, 10);

  if (!id || !title || !status)
    return Response.json(
      { error: 'Enter a bank name and status.' },
      { status: 400 },
    );

  if (lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated))
    return Response.json(
      { error: 'Enter a valid last-updated date.' },
      { status: 400 },
    );

  const existing = (await runtime.DB.prepare('SELECT id, logo_url, full_report, report_pdf_key, report_pdf_name FROM banks WHERE id=?')
    .bind(id)
    .first()) as { id: string; logo_url: string; full_report: string; report_pdf_key: string; report_pdf_name: string } | null;

  if (!existing)
    return Response.json({ error: 'Bank not found.' }, { status: 404 });

  let fullReport = existing.full_report || '';
  if (body.full_report !== undefined) {
    if (typeof body.full_report !== 'string') {
      return Response.json({ error: 'Invalid report content.' }, { status: 400 });
    }
    const rawReport = String(body.full_report || '').trim();
    fullReport = isHtmlReport(rawReport) ? sanitizeReportHtml(rawReport) : rawReport;
    if (fullReport.length > 512000) {
      return Response.json(
        { error: 'Report content exceeds the maximum size limit of 500 KB. Please reduce text length or use the attached PDF.' },
        { status: 413 },
      );
    }
  }

  const duplicate = (await runtime.DB.prepare(
    'SELECT id, title FROM banks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND id != ?',
  )
    .bind(title, id)
    .first()) as { id: string; title: string } | null;

  if (duplicate) {
    return Response.json(
      {
        error: `Another bank named "${duplicate.title}" already exists.`,
      },
      { status: 409 },
    );
  }

  const logoUrl =
    body.logo_url !== undefined
      ? clean(body.logo_url, 1000)
      : existing.logo_url || '';

  const reportPdfKey =
    body.report_pdf_key !== undefined
      ? clean(body.report_pdf_key, 250)
      : (existing.report_pdf_key || '');

  const reportPdfName =
    body.report_pdf_name !== undefined
      ? clean(body.report_pdf_name, 250)
      : (existing.report_pdf_name || '');

  await runtime.DB.prepare(
    'UPDATE banks SET title=?,status=?,summary=?,comment=?,last_updated=?,full_report=?,institution_type=?,website=?,logo_url=?,researcher=?,source_urls=?,ownership_details=?,iska_details=?,internal_notes=?,sort_order=?,report_pdf_key=?,report_pdf_name=? WHERE id=?',
  )
    .bind(
      title,
      status,
      clean(body.summary, 3000),
      clean(body.comment, 2000),
      lastUpdated,
      fullReport,
      clean(body.institution_type, 150),
      clean(body.website, 1000),
      logoUrl,
      clean(body.researcher, 250),
      clean(body.source_urls, 10000),
      clean(body.ownership_details, 10000),
      clean(body.iska_details, 10000),
      clean(body.internal_notes, 10000),
      Number(body.sort_order) || 0,
      reportPdfKey,
      reportPdfName,
      id,
    )
    .run();

  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json(
      { error: 'Unauthorized: Only an owner can delete a bank.' },
      { status: 403 },
    );

  const runtime = await env();
  await ensureBanks(runtime.DB);
  await runtime.DB.prepare('DELETE FROM banks WHERE id=?')
    .bind(clean(new URL(request.url).searchParams.get('id'), 80))
    .run();

  return Response.json({ deleted: true });
}
