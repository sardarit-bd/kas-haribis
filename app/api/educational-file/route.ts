import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureEducationalResources } from '../../lib/directories';
export async function GET(r: Request) {
  const url = new URL(r.url),
    id = url.searchParams.get('id') || '',
    download = url.searchParams.get('download') === '1';
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return new Response('Not found', { status: 404 });
  const { env } = await import('cloudflare:workers');
  await ensureEducationalResources(env.DB);
  const row = (await env.DB.prepare(
    'SELECT file_key,file_name,file_type,published FROM educational_resources WHERE id=?',
  )
    .bind(id)
    .first()) as any;
  if (
    !row ||
    (!row.published &&
      !(await isOwnerRequest(r)))
  )
    return new Response('Not found', { status: 404 });
  if (String(row.file_key).startsWith('static:'))
    return Response.redirect(
      new URL(String(row.file_key).slice(7), r.url),
      302,
    );
  const object = await env.BUCKET.get(row.file_key);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type': row.file_type || 'application/octet-stream',
      'content-disposition': `${download ? 'attachment' : 'inline'}; filename="${String(row.file_name).replace(/\"/g, '')}"`,
      'cache-control': 'public,max-age=300',
    },
  });
}
