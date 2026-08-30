export async function GET(r: Request) {
  const id = new URL(r.url).searchParams.get('id') || '';
  if (!id) return new Response('Missing logo', { status: 400 });
  const { env } = await import('cloudflare:workers'),
    object = await env.BUCKET.get(`savings-logos/${id}`);
  if (!object) return new Response('Logo not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=86400');
  return new Response(object.body, { headers });
}
