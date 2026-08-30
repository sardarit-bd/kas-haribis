export async function GET(r: Request) {
  const id = new URL(r.url).searchParams.get('id') || '';
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return new Response('Not found', { status: 404 });
  const { env } = await import('cloudflare:workers'),
    o = await env.BUCKET.get(`loan-service-logos/${id}`);
  if (!o) return new Response('Not found', { status: 404 });
  return new Response(o.body, {
    headers: {
      'content-type': o.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public,max-age=3600',
    },
  });
}
