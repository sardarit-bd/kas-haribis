import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureEducationalResources } from '../../../lib/directories';
const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
  safe = (value: string) => /^[a-zA-Z0-9-]{1,80}$/.test(value);
export async function POST(r: Request) {
  if (
    !(await isOwnerRequest(r))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    action = r.headers.get('x-upload-action') || '';
  if (action === 'chunk') {
    const id = r.headers.get('x-resource-id') || '',
      uploadId = r.headers.get('x-upload-id') || '',
      index = Number(r.headers.get('x-chunk-index')),
      total = Number(r.headers.get('x-chunk-total'));
    if (
      !safe(id) ||
      !safe(uploadId) ||
      !Number.isInteger(index) ||
      !Number.isInteger(total) ||
      index < 0 ||
      index >= total ||
      total < 1 ||
      total > 40
    )
      return Response.json({ error: 'Invalid upload.' }, { status: 400 });
    const bytes = await r.arrayBuffer();
    if (bytes.byteLength > 600 * 1024)
      return Response.json(
        { error: 'Upload piece is too large.' },
        { status: 400 },
      );
    await env.BUCKET.put(`education/tmp/${uploadId}/${index}`, bytes);
    return Response.json({ saved: true, index });
  }
  if (action === 'complete') {
    const body = (await r.json()) as any,
      id = String(body.id || ''),
      uploadId = String(body.uploadId || ''),
      total = Number(body.total),
      fileName = String(body.fileName || '').slice(0, 240),
      fileType = String(body.fileType || '');
    if (
      !safe(id) ||
      !safe(uploadId) ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > 40 ||
      !allowed.includes(fileType)
    )
      return Response.json(
        { error: 'Invalid upload details.' },
        { status: 400 },
      );
    await ensureEducationalResources(env.DB);
    const parts: ArrayBuffer[] = [],
      partKeys: string[] = [];
    let size = 0;
    for (let index = 0; index < total; index++) {
      const partKey = `education/tmp/${uploadId}/${index}`,
        object = await env.BUCKET.get(partKey);
      if (!object)
        return Response.json(
          { error: 'Part of the file did not arrive. Please try again.' },
          { status: 400 },
        );
      const part = await object.arrayBuffer();
      size += part.byteLength;
      if (size > 20 * 1024 * 1024)
        return Response.json(
          { error: 'Choose a file up to 20 MB.' },
          { status: 400 },
        );
      parts.push(part);
      partKeys.push(partKey);
    }
    const combined = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      combined.set(new Uint8Array(part), offset);
      offset += part.byteLength;
    }
    const old = (await env.DB.prepare(
      'SELECT file_key FROM educational_resources WHERE id=?',
    )
      .bind(id)
      .first()) as any;
    const ext =
        fileName
          .split('.')
          .pop()
          ?.replace(/[^a-z0-9]/gi, '')
          .toLowerCase() || 'file',
      key = `education/${id}.${ext}`;
    await env.BUCKET.put(key, combined, {
      httpMetadata: { contentType: fileType },
    });
    await env.DB.prepare(
      'UPDATE educational_resources SET file_key=?,file_name=?,file_type=?,published=?,updated_at=? WHERE id=?',
    )
      .bind(
        key,
        fileName,
        fileType,
        body.published ? 1 : 0,
        new Date().toISOString(),
        id,
      )
      .run();
    await Promise.all(partKeys.map((key) => env.BUCKET.delete(key)));
    if (
      old?.file_key &&
      !String(old.file_key).startsWith('static:') &&
      old.file_key !== key
    )
      await env.BUCKET.delete(old.file_key);
    return Response.json({ saved: true });
  }
  return Response.json({ error: 'Please retry the upload.' }, { status: 400 });
}
