import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureSeforim, listSeforim } from '../../lib/seforim';
const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  return env;
}
export async function GET() {
  const env = await runtime();
  return Response.json({ books: await listSeforim(env.DB) });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  await ensureSeforim(env.DB);
  const body = (await request.json()) as any;
  const title = clean(body.title, 240),
    description = clean(body.description, 1200),
    price = Number(body.price),
    pdfPrice = Number(body.pdf_price || 0);
  if (
    !title ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 10000 ||
    !Number.isFinite(pdfPrice) ||
    pdfPrice < 0 ||
    pdfPrice > 10000
  )
    return Response.json(
      { error: 'Enter valid book and PDF prices.' },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  const max = (await env.DB.prepare(
    'SELECT MAX(sort_order) AS value FROM seforim',
  ).first()) as { value?: number } | null;
  await env.DB.prepare(
    'INSERT INTO seforim(id,title,price,available,image,description,sort_order,created_at,pdf_available,pdf_price) VALUES(?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      id,
      title,
      price,
      body.available ? 1 : 0,
      '/seforim/book-01.webp',
      description,
      Number(max?.value || 0) + 1,
      new Date().toISOString(),
      0,
      pdfPrice,
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  await ensureSeforim(env.DB);
  const body = (await request.json()) as any;
  const id = clean(body.id, 80),
    title = clean(body.title, 240),
    description = clean(body.description, 1200),
    price = Number(body.price),
    pdfPrice = Number(body.pdf_price || 0);
  if (
    !id ||
    !title ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 10000 ||
    !Number.isFinite(pdfPrice) ||
    pdfPrice < 0 ||
    pdfPrice > 10000
  )
    return Response.json(
      { error: 'Enter valid book and PDF prices.' },
      { status: 400 },
    );
  await env.DB.prepare(
    "UPDATE seforim SET title=?,price=?,available=?,description=?,sort_order=?,pdf_price=?,pdf_available=CASE WHEN ?=1 AND length(COALESCE(pdf_storage_key,''))>0 THEN 1 ELSE 0 END WHERE id=?",
  )
    .bind(
      title,
      price,
      body.available ? 1 : 0,
      description,
      Number(body.sort_order) || 0,
      pdfPrice,
      body.pdf_display ? 1 : 0,
      id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  await ensureSeforim(env.DB);
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  const book = (await env.DB.prepare(
    'SELECT image,pdf_storage_key FROM seforim WHERE id=?',
  )
    .bind(id)
    .first()) as { image?: string; pdf_storage_key?: string } | null;
  if (book?.image?.startsWith('/api/seforim-cover'))
    await env.BUCKET.delete(`seforim/covers/${id}`);
  if (book?.pdf_storage_key) await env.BUCKET.delete(book.pdf_storage_key);
  await env.DB.prepare('DELETE FROM seforim WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}
