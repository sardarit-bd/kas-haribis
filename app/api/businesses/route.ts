import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureBusinesses, listBusinesses } from '../../lib/directories';
const clean = (v: unknown, n = 3000) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
const fields = [
  'name',
  'category',
  'description',
  'address',
  'city',
  'state',
  'zip',
  'phone',
  'email',
  'website',
  'logo_url',
  'iska_authority',
  'iska_details',
  'verification_status',
  'last_verified',
  'public_notes',
  'internal_notes',
  'source_url',
];
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(request: Request) {
  const e = await runtime();
  return Response.json({
    businesses: await listBusinesses(e.DB, (await isOwnerRequest(request))),
  });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime();
  await ensureBusinesses(e.DB);
  const b = (await request.json()) as any;
  if (!clean(b.name, 200))
    return Response.json(
      { error: 'Enter the business name.' },
      { status: 400 },
    );
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    values = fields.map((f, i) =>
      clean(b[f], i === 2 || i === 12 || i === 15 ? 8000 : 500),
    );
  await e.DB.prepare(
    `INSERT INTO businesses(id,${fields.join(',')},published,sort_order,created_at,updated_at) VALUES(${Array(
      fields.length + 5,
    )
      .fill('?')
      .join(',')})`,
  )
    .bind(
      id,
      ...values,
      b.published ? 1 : 0,
      Number(b.sort_order) || 0,
      now,
      now,
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime();
  await ensureBusinesses(e.DB);
  const b = (await request.json()) as any,
    id = clean(b.id, 80);
  if (!id || !clean(b.name, 200))
    return Response.json(
      { error: 'Enter the business name.' },
      { status: 400 },
    );
  const values = fields.map((f, i) =>
    clean(b[f], i === 2 || i === 12 || i === 15 ? 8000 : 500),
  );
  await e.DB.prepare(
    `UPDATE businesses SET ${fields.map((f) => `${f}=?`).join(',')},published=?,sort_order=?,updated_at=? WHERE id=?`,
  )
    .bind(
      ...values,
      b.published ? 1 : 0,
      Number(b.sort_order) || 0,
      new Date().toISOString(),
      id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    id = clean(new URL(request.url).searchParams.get('id'), 80);
  await ensureBusinesses(e.DB);
  await e.DB.prepare('DELETE FROM businesses WHERE id=?').bind(id).run();
  await e.BUCKET.delete(`business-logos/${id}`);
  return Response.json({ deleted: true });
}
