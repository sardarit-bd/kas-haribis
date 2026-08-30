import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureSeforim } from '../../../lib/seforim';
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url),
    id = url.searchParams.get('id') || '',
    display = url.searchParams.get('display') !== '0',
    type = request.headers.get('content-type') || '';
  if (type !== 'application/pdf')
    return Response.json({ error: 'Choose a PDF file.' }, { status: 400 });
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 30 * 1024 * 1024)
    return Response.json(
      { error: 'The PDF must be smaller than 30 MB.' },
      { status: 413 },
    );
  const { env } = await import('cloudflare:workers');
  await ensureSeforim(env.DB);
  const book = await env.DB.prepare('SELECT id FROM seforim WHERE id=?')
    .bind(id)
    .first();
  if (!book)
    return Response.json({ error: 'Book not found.' }, { status: 404 });
  const key = `seforim/pdfs/${id}.pdf`,
    filename =
      (request.headers.get('x-file-name') || 'Kav-Haribis-Sefer.pdf')
        .replace(/[^a-zA-Z0-9._ -]/g, '')
        .slice(0, 120) || 'Kav-Haribis-Sefer.pdf';
  await env.BUCKET.put(key, bytes, {
    httpMetadata: { contentType: 'application/pdf' },
  });
  await env.DB.prepare(
    'UPDATE seforim SET pdf_storage_key=?,pdf_filename=?,pdf_available=? WHERE id=?',
  )
    .bind(key, filename, display ? 1 : 0, id)
    .run();
  return Response.json({ saved: true, filename });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id') || '';
  const { env } = await import('cloudflare:workers');
  await ensureSeforim(env.DB);
  const row = (await env.DB.prepare(
    'SELECT pdf_storage_key FROM seforim WHERE id=?',
  )
    .bind(id)
    .first()) as any;
  if (row?.pdf_storage_key) await env.BUCKET.delete(row.pdf_storage_key);
  await env.DB.prepare(
    'UPDATE seforim SET pdf_storage_key=NULL,pdf_filename=NULL,pdf_available=0 WHERE id=?',
  )
    .bind(id)
    .run();
  return Response.json({ removed: true });
}
