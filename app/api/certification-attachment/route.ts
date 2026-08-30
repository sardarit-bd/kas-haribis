import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureCertificationApplications } from '../../lib/certification-applications';
export async function GET(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return new Response('Unauthorized', { status: 401 });
  const id = new URL(request.url).searchParams.get('id') || '',
    { env } = await import('cloudflare:workers');
  await ensureCertificationApplications(env.DB);
  const row = (await env.DB.prepare(
    'SELECT attachment_key,attachment_name FROM certification_applications WHERE id=?',
  )
    .bind(id)
    .first()) as any;
  if (!row?.attachment_key) return new Response('Not found', { status: 404 });
  const object = await env.BUCKET.get(row.attachment_key);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type':
        object.httpMetadata?.contentType || 'application/octet-stream',
      'content-disposition': `inline; filename=\"${String(row.attachment_name || 'document').replace(/[\"\r\n]/g, '')}\"`,
    },
  });
}
