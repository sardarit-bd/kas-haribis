import { ensureAudio } from '../../lib/directories';
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const { env } = await import('cloudflare:workers');
  await ensureAudio(env.DB);
  const item = await env.DB.prepare('SELECT id FROM audio_items WHERE id=?')
    .bind(id)
    .first();
  if (!item) return new Response('Not found', { status: 404 });
  const object = await env.BUCKET.get(`audio/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || 'audio/mpeg',
      'cache-control': 'public, max-age=300',
      'accept-ranges': 'bytes',
    },
  });
}
