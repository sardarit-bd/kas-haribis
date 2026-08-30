import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureArticles, listArticles } from '../../lib/directories';
const clean = (v: unknown, n = 5000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
const fields = [
  'title',
  'hebrew_title',
  'publication_date',
  'author',
  'summary',
  'pdf_url',
  'cover_url',
];
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  const e = await runtime();
  return Response.json({ articles: await listArticles(e.DB, (await isOwnerRequest(r))) });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureArticles(e.DB);
  if (!clean(b.title, 240))
    return Response.json({ error: 'Enter an article title.' }, { status: 400 });
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    v = fields.map((f) => clean(b[f], f === 'summary' ? 8000 : 500));
  await e.DB.prepare(
    `INSERT INTO articles(id,${fields.join(',')},page_count,published,featured,sort_order,created_at,updated_at) VALUES(${Array(
      fields.length + 7,
    )
      .fill('?')
      .join(',')})`,
  )
    .bind(
      id,
      ...v,
      Number(b.page_count) || 0,
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
  const e = await runtime(),
    b = (await r.json()) as any,
    id = clean(b.id, 80);
  await ensureArticles(e.DB);
  if (!id || !clean(b.title, 240))
    return Response.json({ error: 'Enter an article title.' }, { status: 400 });
  const v = fields.map((f) => clean(b[f], f === 'summary' ? 8000 : 500));
  await e.DB.prepare(
    `UPDATE articles SET ${fields.map((f) => `${f}=?`).join(',')},page_count=?,published=?,featured=?,sort_order=?,updated_at=? WHERE id=?`,
  )
    .bind(
      ...v,
      Number(b.page_count) || 0,
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
  const e = await runtime(),
    id = clean(new URL(r.url).searchParams.get('id'), 80);
  await ensureArticles(e.DB);
  await e.DB.prepare('DELETE FROM articles WHERE id=?').bind(id).run();
  await e.BUCKET.delete(`articles/${id}.pdf`);
  return Response.json({ deleted: true });
}
