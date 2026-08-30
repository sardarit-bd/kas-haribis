import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
export async function GET(r: Request) {
  const id = new URL(r.url).searchParams.get('id') || '';
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return new Response('Not found', { status: 404 });
  const { env } = await import('cloudflare:workers'),
    row = (await env.DB.prepare('SELECT published FROM articles WHERE id=?')
      .bind(id)
      .first()) as any;
  if (
    !row?.published &&
    !(await isOwnerRequest(r))
  )
    return new Response('Not found', { status: 404 });
  const o = await env.BUCKET.get(`articles/${id}.pdf`);
  if (!o) return new Response('Not found', { status: 404 });
  return new Response(o.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'inline',
      'cache-control': 'private,max-age=300',
    },
  });
}
