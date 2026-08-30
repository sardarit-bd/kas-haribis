import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureSeforim } from '../../lib/seforim';
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const { env } = await import('cloudflare:workers');
  await ensureSeforim(env.DB);
  const book = await env.DB.prepare('SELECT id FROM seforim WHERE id=?')
    .bind(id)
    .first();
  if (!book) return new Response('Not found', { status: 404 });
  const object = await env.BUCKET.get(`seforim/covers/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/webp',
      'cache-control': 'public, max-age=300',
    },
  });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id') || '';
  const type = request.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)$/.test(type))
    return Response.json(
      { error: 'Choose a JPG, PNG or WebP image.' },
      { status: 400 },
    );
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 5 * 1024 * 1024)
    return Response.json(
      { error: 'The cover must be smaller than 5 MB.' },
      { status: 413 },
    );
  const { env } = await import('cloudflare:workers');
  await ensureSeforim(env.DB);
  const book = await env.DB.prepare('SELECT id FROM seforim WHERE id=?')
    .bind(id)
    .first();
  if (!book)
    return Response.json({ error: 'Book not found.' }, { status: 404 });
  await env.BUCKET.put(`seforim/covers/${id}`, bytes, {
    httpMetadata: { contentType: type },
  });
  const image = `/api/seforim-cover?id=${encodeURIComponent(id)}&v=${Date.now()}`;
  await env.DB.prepare('UPDATE seforim SET image=? WHERE id=?')
    .bind(image, id)
    .run();
  return Response.json({ saved: true, image });
}
