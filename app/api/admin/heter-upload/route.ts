import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureHeterTables } from '../../../lib/heter-documents';

const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  await ensureHeterTables(env.DB);

  try {
    if (action === 'start') {
      const body = (await request.json()) as Record<string, unknown>;
      const title = clean(body.title, 140),
        description = clean(body.description, 800),
        filename = clean(body.filename, 180);
      const size = Number(body.size);
      if (
        !title ||
        !filename.toLowerCase().endsWith('.pdf') ||
        !Number.isFinite(size) ||
        size < 1 ||
        size > 100 * 1024 * 1024
      )
        return Response.json(
          { error: 'Choose a PDF up to 100 MB and enter its title.' },
          { status: 400 },
        );
      const id = crypto.randomUUID();
      const key = `heter-iska/${id}.pdf`;
      const upload = await env.BUCKET.createMultipartUpload(key, {
        httpMetadata: {
          contentType: 'application/pdf',
          contentDisposition: `attachment; filename="${filename.replaceAll('"', '')}"`,
        },
        customMetadata: {
          title,
          description,
          filename,
          size: String(size),
          documentId: id,
        },
      });
      return Response.json({ id, key, uploadId: upload.uploadId });
    }
    if (action === 'part') {
      const key = clean(url.searchParams.get('key'), 200),
        uploadId = clean(url.searchParams.get('uploadId'), 200),
        partNumber = Number(url.searchParams.get('partNumber'));
      if (
        !key.startsWith('heter-iska/') ||
        !uploadId ||
        !Number.isInteger(partNumber) ||
        partNumber < 1 ||
        partNumber > 10000
      )
        return Response.json(
          { error: 'Invalid upload part.' },
          { status: 400 },
        );
      const bytes = await request.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > 6 * 1024 * 1024)
        return Response.json(
          { error: 'Upload piece is too large.' },
          { status: 413 },
        );
      const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
      const part = await upload.uploadPart(partNumber, bytes);
      return Response.json({ partNumber: part.partNumber, etag: part.etag });
    }
    if (action === 'complete') {
      const body = (await request.json()) as any;
      const id = clean(body.id, 60),
        key = clean(body.key, 200),
        uploadId = clean(body.uploadId, 200),
        title = clean(body.title, 140),
        description = clean(body.description, 800),
        filename = clean(body.filename, 180),
        size = Number(body.size);
      if (
        !id ||
        key !== `heter-iska/${id}.pdf` ||
        !uploadId ||
        !Array.isArray(body.parts) ||
        !body.parts.length
      )
        return Response.json(
          { error: 'Invalid upload completion.' },
          { status: 400 },
        );
      const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
      await upload.complete(
        body.parts.map((part: any) => ({
          partNumber: Number(part.partNumber),
          etag: String(part.etag),
        })),
      );
      const active = Number(body.active) === 1 ? 1 : 0;
      await env.DB.prepare(
        'INSERT INTO heter_documents(id,title,description,filename,storage_key,size,active,created_at) VALUES(?,?,?,?,?,?,?,?)',
      )
        .bind(
          id,
          title,
          description,
          filename,
          key,
          size,
          active,
          new Date().toISOString(),
        )
        .run();
      return Response.json({ saved: true, id });
    }
    if (action === 'abort') {
      const body = (await request.json()) as any;
      if (String(body.key || '').startsWith('heter-iska/') && body.uploadId)
        await env.BUCKET.resumeMultipartUpload(
          String(body.key),
          String(body.uploadId),
        ).abort();
      return Response.json({ aborted: true });
    }
    return Response.json({ error: 'Unknown upload action.' }, { status: 400 });
  } catch (error) {
    console.error('Heter Iska upload error', error);
    return Response.json(
      { error: 'The PDF could not be uploaded. Please try again.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = clean(new URL(request.url).searchParams.get('id'), 60);
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const document = (await env.DB.prepare(
    'SELECT storage_key FROM heter_documents WHERE id=?',
  )
    .bind(id)
    .first()) as { storage_key?: string } | null;
  if (!document?.storage_key)
    return Response.json({ error: 'Document not found.' }, { status: 404 });
  await Promise.all([
    env.BUCKET.delete(document.storage_key),
    env.BUCKET.delete(`heter-preview/${id}.pdf`),
  ]);
  await env.DB.prepare('DELETE FROM heter_documents WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}

export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as Record<string, unknown>;
  const id = clean(body.id, 60);
  if (!id)
    return Response.json({ error: 'Document not found.' }, { status: 400 });
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const document = await env.DB.prepare(
    'SELECT id FROM heter_documents WHERE id=?',
  )
    .bind(id)
    .first();
  if (!document)
    return Response.json({ error: 'Document not found.' }, { status: 404 });
  if (body.active === 0 || body.active === 1) {
    await env.DB.prepare('UPDATE heter_documents SET active=? WHERE id=?')
      .bind(Number(body.active), id)
      .run();
    return Response.json({ saved: true, active: Number(body.active) });
  }
  const title = clean(body.title, 140),
    description = clean(body.description, 800);
  if (!title)
    return Response.json({ error: 'Enter a document title.' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE heter_documents SET title=?,description=? WHERE id=?',
  )
    .bind(title, description, id)
    .run();
  return Response.json({ saved: true });
}
