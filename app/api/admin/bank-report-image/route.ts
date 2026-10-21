import { getRequestEmail } from '../../../lib/request-auth';
import { canAccessSection } from '../../../lib/admin-access';
import { ensureBanks } from '../../../lib/directories';

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

function detectImageFormat(bytes: Uint8Array): { valid: boolean; ext: string; mime: string } {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }

  // WebP: RIFF .... WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }

  return { valid: false, ext: '', mime: '' };
}

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  const email = await getRequestEmail(request);
  if (!(await canAccessSection(env.DB, email, 'banks'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureBanks(env.DB);
  const form = await request.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: 'Invalid form submission.' }, { status: 400 });
  }

  const bankId = String(form.get('bankId') || form.get('id') || '').trim();
  const file = form.get('file');

  if (!bankId) {
    return Response.json({ error: 'Bank ID is required.' }, { status: 400 });
  }

  // Allow existing banks in D1, or a valid draft UUID generated client-side for new bank creation
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bankId);
  const bank = (await env.DB.prepare('SELECT id FROM banks WHERE id=?')
    .bind(bankId)
    .first()) as { id: string } | null;

  if (!bank && !isValidUuid) {
    return Response.json({ error: 'Bank record or valid draft identifier not found.' }, { status: 404 });
  }

  if (!(file instanceof File) || !file.size) {
    return Response.json({ error: 'Please select a valid image file.' }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { error: `Image is too large. Maximum allowed size is 1 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.` },
      { status: 413 },
    );
  }

  const buffer = await file.arrayBuffer();
  const headerBytes = new Uint8Array(buffer.slice(0, 16));
  const format = detectImageFormat(headerBytes);

  if (!format.valid) {
    return Response.json(
      { error: 'Invalid image format. Only PNG, JPEG, and WebP images with valid signatures are accepted.' },
      { status: 400 },
    );
  }

  const uniqueId = crypto.randomUUID();
  const key = `bank-reports/${bankId}/images/${uniqueId}.${format.ext}`;

  await env.BUCKET.put(key, buffer, {
    httpMetadata: {
      contentType: format.mime,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const url = `/api/bank-report-image?bankId=${encodeURIComponent(bankId)}&id=${encodeURIComponent(uniqueId)}&ext=${format.ext}`;

  return Response.json({
    saved: true,
    bankId,
    url,
    key,
  });
}
