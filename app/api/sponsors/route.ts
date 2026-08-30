import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
async function db() {
  const { env } = await import('cloudflare:workers');
  return env.DB;
}
async function table(d: any) {
  await d
    .prepare(
      'CREATE TABLE IF NOT EXISTS sponsors (id INTEGER PRIMARY KEY AUTOINCREMENT,company_name TEXT NOT NULL,ad_type TEXT NOT NULL,description TEXT,phone TEXT,image_key TEXT,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)',
    )
    .run();
}
export async function GET(request: Request) {
  const d = await db();
  await table(d);
  const admin =
    (await isOwnerRequest(request));
  const result = await d
    .prepare(
      admin
        ? 'SELECT * FROM sponsors ORDER BY id DESC'
        : 'SELECT * FROM sponsors WHERE active=1 ORDER BY id DESC',
    )
    .all();
  return Response.json({ sponsors: result.results });
}
export async function POST(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as Record<string, string>;
  if (!body.companyName?.trim())
    return Response.json(
      { error: 'Company name is required.' },
      { status: 400 },
    );
  const d = await db();
  await table(d);
  await d
    .prepare(
      'INSERT INTO sponsors(company_name,ad_type,description,phone,active,created_at) VALUES(?,?,?,?,1,?)',
    )
    .bind(
      body.companyName.trim(),
      body.adType || 'details',
      body.description?.trim() || null,
      body.phone?.trim() || null,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ saved: true });
}
export async function PUT(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as Record<string, string>;
  if (!body.id || !body.companyName?.trim())
    return Response.json(
      { error: 'Company name is required.' },
      { status: 400 },
    );
  const d = await db();
  await table(d);
  const existing = await d
    .prepare('SELECT id FROM sponsors WHERE id=?')
    .bind(body.id)
    .first();
  if (!existing)
    return Response.json(
      { error: 'Advertisement not found.' },
      { status: 404 },
    );
  await d
    .prepare(
      'UPDATE sponsors SET company_name=?,ad_type=?,description=?,phone=? WHERE id=?',
    )
    .bind(
      body.companyName.trim(),
      body.adType || 'details',
      body.description?.trim() || null,
      body.phone?.trim() || null,
      body.id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  const d = await db();
  await table(d);
  await d.prepare('DELETE FROM sponsors WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}
