import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureAudio } from '../../../lib/directories';

const clean = (value: unknown, length: number) =>
  String(value || '')
    .trim()
    .slice(0, length);
const allowedMedia =
  /^(audio\/(mpeg|mp4|aac|x-m4a|wav|x-wav)|video\/(mp4|webm|quicktime))$/;

export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  await ensureAudio(env.DB);
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  try {
    if (action === 'start') {
      const body = (await request.json()) as any;
      const id = clean(body.id, 80),
        type = clean(body.type, 80),
        size = Number(body.size);
      if (
        !id ||
        !allowedMedia.test(type) ||
        !Number.isFinite(size) ||
        size < 1 ||
        size > 500 * 1024 * 1024
      )
        return Response.json(
          { error: 'Choose a supported audio or video file up to 500 MB.' },
          { status: 400 },
        );
      const item = await env.DB.prepare('SELECT id FROM audio_items WHERE id=?')
        .bind(id)
        .first();
      if (!item)
        return Response.json(
          { error: 'Save the listing before uploading its file.' },
          { status: 404 },
        );
      const upload = await env.BUCKET.createMultipartUpload(`audio/${id}`, {
        httpMetadata: { contentType: type },
      });
      return Response.json({
        id,
        key: `audio/${id}`,
        uploadId: upload.uploadId,
      });
    }
    if (action === 'part') {
      const key = clean(url.searchParams.get('key'), 160),
        uploadId = clean(url.searchParams.get('uploadId'), 200),
        partNumber = Number(url.searchParams.get('partNumber'));
      if (
        !key.startsWith('audio/') ||
        !uploadId ||
        !Number.isInteger(partNumber)
      )
        return Response.json(
          { error: 'Invalid upload piece.' },
          { status: 400 },
        );
      const bytes = await request.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > 6 * 1024 * 1024)
        return Response.json(
          { error: 'Upload piece is too large.' },
          { status: 413 },
        );
      const part = await env.BUCKET.resumeMultipartUpload(
        key,
        uploadId,
      ).uploadPart(partNumber, bytes);
      return Response.json({ partNumber: part.partNumber, etag: part.etag });
    }
    if (action === 'complete') {
      const body = (await request.json()) as any;
      const id = clean(body.id, 80),
        key = clean(body.key, 160),
        uploadId = clean(body.uploadId, 200);
      if (key !== `audio/${id}` || !Array.isArray(body.parts))
        return Response.json(
          { error: 'Invalid upload completion.' },
          { status: 400 },
        );
      await env.BUCKET.resumeMultipartUpload(key, uploadId).complete(
        body.parts.map((part: any) => ({
          partNumber: Number(part.partNumber),
          etag: String(part.etag),
        })),
      );
      const mediaUrl = `/api/audio-file?id=${encodeURIComponent(id)}&v=${Date.now()}`;
      await env.DB.prepare('UPDATE audio_items SET audio_url=? WHERE id=?')
        .bind(mediaUrl, id)
        .run();
      return Response.json({ saved: true, audioUrl: mediaUrl });
    }
    if (action === 'abort') {
      const body = (await request.json()) as any;
      if (String(body.key || '').startsWith('audio/') && body.uploadId)
        await env.BUCKET.resumeMultipartUpload(
          String(body.key),
          String(body.uploadId),
        ).abort();
      return Response.json({ aborted: true });
    }
    return Response.json({ error: 'Unknown upload action.' }, { status: 400 });
  } catch (error) {
    console.error('Media upload error', error);
    return Response.json(
      { error: 'The media file could not be uploaded.' },
      { status: 500 },
    );
  }
}
