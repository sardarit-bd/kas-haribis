import { isOwnerRequest } from '../../../lib/request-auth';

export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    form = await request.formData(),
    file = form.get('file'),
    id = String(form.get('id') || '');
  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Save the advertisement before uploading its logo.' },
      { status: 400 },
    );
  if (
    !/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    return Response.json(
      { error: 'Choose a PNG, JPG, WEBP, GIF or SVG logo up to 5 MB.' },
      { status: 400 },
    );
  const key = `sponsor-logos/${id}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const imageUrl = `/api/sponsor-logo?id=${encodeURIComponent(id)}&v=${Date.now()}`;
  await env.DB.prepare(
    'UPDATE sponsors SET image_key=? WHERE id=?',
  )
    .bind(imageUrl, id)
    .run();
  return Response.json({ saved: true, imageUrl });
}
