export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return new Response('Not found', { status: 404 });
  const { env } = await import('cloudflare:workers'),
    object = await env.BUCKET.get(`business-logos/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'image/png',
      'cache-control': 'public, max-age=3600',
    },
  });
}
