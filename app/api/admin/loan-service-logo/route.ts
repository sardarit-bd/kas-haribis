import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureLoanServices } from '../../../lib/directories';
export async function POST(r: Request) {
  if (
    !(await isOwnerRequest(r))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    f = await r.formData(),
    file = f.get('file'),
    id = String(f.get('id') || '');
  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Save the listing before uploading its logo.' },
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
  await ensureLoanServices(env.DB);
  await env.BUCKET.put(`loan-service-logos/${id}`, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const logoUrl = `/api/loan-service-logo?id=${encodeURIComponent(id)}&v=${Date.now()}`;
  await env.DB.prepare(
    'UPDATE loan_services SET logo_url=?,updated_at=? WHERE id=?',
  )
    .bind(logoUrl, new Date().toISOString(), id)
    .run();
  return Response.json({ saved: true, logoUrl });
}
