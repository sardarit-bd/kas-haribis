import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureBusinesses } from '../../../lib/directories';
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    form = await request.formData(),
    file = form.get('file'),
    id = String(form.get('id') || '');
  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Choose a logo after saving the business.' },
      { status: 400 },
    );
  if (
    !/^image\/(png|jpeg|webp|gif)$/.test(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    return Response.json(
      { error: 'Choose a PNG, JPG, WEBP or GIF logo up to 5 MB.' },
      { status: 400 },
    );
  await ensureBusinesses(env.DB);
  const key = `business-logos/${id}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const logoUrl = `/api/business-logo?id=${encodeURIComponent(id)}&v=${Date.now()}`;
  await env.DB.prepare(
    'UPDATE businesses SET logo_url=?,updated_at=? WHERE id=?',
  )
    .bind(logoUrl, new Date().toISOString(), id)
    .run();
  return Response.json({ saved: true, logoUrl });
}
