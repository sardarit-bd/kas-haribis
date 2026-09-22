import { canAccessSection } from '../../../lib/admin-access';
import { getRequestEmail } from '../../../lib/request-auth';

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  const email = await getRequestEmail(request);

  if (!(await canAccessSection(env.DB, email, 'about-members'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const id = String(form.get('id') || '');

  if (!(file instanceof File) || !id) {
    return Response.json(
      { error: 'Save the team member before uploading image.' },
      { status: 400 },
    );
  }

  if (
    !/^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    return Response.json(
      { error: 'Choose a PNG, JPG, WEBP, GIF or SVG image up to 5 MB.' },
      { status: 400 },
    );
  }

  const key = `about-member-images/${id}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const imageUrl = `/api/about-member-image?id=${encodeURIComponent(id)}&v=${Date.now()}`;
  await env.DB.prepare('UPDATE about_members SET image_url=? WHERE id=?')
    .bind(imageUrl, id)
    .run();

  return Response.json({ saved: true, imageUrl });
}
