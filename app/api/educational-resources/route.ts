import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import {
  ensureEducationalResources,
  listEducationalResources,
} from '../../lib/directories';
const clean = (v: unknown, n = 4000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  const env = await runtime();
  return Response.json({
    resources: await listEducationalResources(env.DB, (await isOwnerRequest(r)) && !r.headers.get('x-kh-staff-email')),
  });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await r.json()) as any,
    id = crypto.randomUUID(),
    now = new Date().toISOString();
  await ensureEducationalResources(env.DB);
  if (!clean(b.title, 240))
    return Response.json({ error: 'Enter a title.' }, { status: 400 });
  await env.DB.prepare(
    'INSERT INTO educational_resources(id,title,description,resource_type,audience,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      id,
      clean(b.title, 240),
      clean(b.description),
      clean(b.resource_type, 80) || 'Coloring Page',
      clean(b.audience, 160),
      b.published ? 1 : 0,
      b.featured ? 1 : 0,
      Number(b.sort_order) || 0,
      now,
      now,
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await r.json()) as any,
    id = clean(b.id, 80);
  await ensureEducationalResources(env.DB);
  if (!id || !clean(b.title, 240))
    return Response.json({ error: 'Enter a title.' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE educational_resources SET title=?,description=?,resource_type=?,audience=?,published=?,featured=?,sort_order=?,updated_at=? WHERE id=?',
  )
    .bind(
      clean(b.title, 240),
      clean(b.description),
      clean(b.resource_type, 80),
      clean(b.audience, 160),
      b.published ? 1 : 0,
      b.featured ? 1 : 0,
      Number(b.sort_order) || 0,
      new Date().toISOString(),
      id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    id = clean(new URL(r.url).searchParams.get('id'), 80);
  await ensureEducationalResources(env.DB);
  const row = (await env.DB.prepare(
    'SELECT file_key FROM educational_resources WHERE id=?',
  )
    .bind(id)
    .first()) as any;
  if (row?.file_key && !String(row.file_key).startsWith('static:'))
    await env.BUCKET.delete(row.file_key);
  await env.DB.prepare('DELETE FROM educational_resources WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
