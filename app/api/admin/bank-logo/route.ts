import { getRequestEmail } from '../../../lib/request-auth';
import { canAccessSection } from '../../../lib/admin-access';
import { ensureBanks } from '../../../lib/directories';

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  const email = await getRequestEmail(request);
  if (!(await canAccessSection(env.DB, email, 'banks')))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  const id = String(form.get('id') || '');

  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Save the bank entry before uploading its logo.' },
      { status: 400 },
    );

  if (
    !/^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/.test(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    return Response.json(
      { error: 'Choose a PNG, JPG, WEBP, or GIF logo up to 5 MB.' },
      { status: 400 },
    );

  await ensureBanks(env.DB);
  const key = `bank-logos/${id}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const logoUrl = `/api/bank-logo?id=${encodeURIComponent(id)}&v=${Date.now()}`;

  await env.DB.prepare(
    'UPDATE banks SET logo_url=? WHERE id=?',
  )
    .bind(logoUrl, id)
    .run();

  return Response.json({ saved: true, logoUrl });
}
