export async function GET(r: Request) {
  const id = new URL(r.url).searchParams.get('id') || '';
  if (!id) return new Response('Missing image', { status: 400 });
  const { env } = await import('cloudflare:workers'),
    o = await env.BUCKET.get(`investment-logos/${id}`);
  if (!o) return new Response('Image not found', { status: 404 });
  const h = new Headers();
  o.writeHttpMetadata(h);
  h.set('cache-control', 'public, max-age=86400');
  return new Response(o.body, { headers: h });
}
