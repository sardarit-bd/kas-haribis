import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureBanks, listBanks, listBanksAdmin } from '../../lib/directories';
const clean = (v: unknown, n: number) =>
  String(v || '')
    .trim()
    .slice(0, n);
async function env() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(request: Request) {
  const runtime = await env();
  return Response.json({
    banks: (await isOwnerRequest(request))
      ? await listBanksAdmin(runtime.DB)
      : await listBanks(runtime.DB),
  });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
  await ensureBanks(runtime.DB);
  const body = (await request.json()) as any;
  const title = clean(body.title, 200),
    status = clean(body.status, 60),
    summary = clean(body.summary, 3000),
    comment = clean(body.comment, 2000),
    lastUpdated = clean(body.last_updated, 10),
    fullReport = clean(body.full_report, 30000);
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
  const id = crypto.randomUUID();
  const max = (await runtime.DB.prepare(
    'SELECT MAX(sort_order) AS value FROM banks',
  ).first()) as any;
  await runtime.DB.prepare(
    'INSERT INTO banks(id,title,status,summary,comment,last_updated,full_report,institution_type,website,researcher,source_urls,ownership_details,iska_details,internal_notes,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
      clean(body.researcher, 250),
      clean(body.source_urls, 10000),
      clean(body.ownership_details, 10000),
      clean(body.iska_details, 10000),
      clean(body.internal_notes, 10000),
      Number(max?.value || 0) + 1,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
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
  const existing = await runtime.DB.prepare('SELECT id FROM banks WHERE id=?')
    .bind(id)
    .first();
  if (!existing)
    return Response.json({ error: 'Bank not found.' }, { status: 404 });
  await runtime.DB.prepare(
    'UPDATE banks SET title=?,status=?,summary=?,comment=?,last_updated=?,full_report=?,institution_type=?,website=?,researcher=?,source_urls=?,ownership_details=?,iska_details=?,internal_notes=?,sort_order=? WHERE id=?',
  )
    .bind(
      title,
      status,
      clean(body.summary, 3000),
      clean(body.comment, 2000),
      lastUpdated,
      clean(body.full_report, 30000),
      clean(body.institution_type, 150),
      clean(body.website, 1000),
      clean(body.researcher, 250),
      clean(body.source_urls, 10000),
      clean(body.ownership_details, 10000),
      clean(body.iska_details, 10000),
      clean(body.internal_notes, 10000),
      Number(body.sort_order) || 0,
      id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
  await ensureBanks(runtime.DB);
  await runtime.DB.prepare('DELETE FROM banks WHERE id=?')
    .bind(clean(new URL(request.url).searchParams.get('id'), 80))
    .run();
  return Response.json({ deleted: true });
}
