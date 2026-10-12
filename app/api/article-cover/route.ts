import { isOwnerRequest } from '../../lib/request-auth';
import { ensureArticles } from '../../lib/directories';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  const { env } = await import('cloudflare:workers');
  await ensureArticles(env.DB);
  const row = (await env.DB.prepare('SELECT published FROM articles WHERE id=?')
    .bind(id)
    .first()) as { published?: number } | null;

  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  if (!row.published && !(await isOwnerRequest(request))) {
    return new Response('Not found', { status: 404 });
  }

  const object = await env.BUCKET.get(`articles/covers/${id}.jpg`);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/jpeg',
      'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
