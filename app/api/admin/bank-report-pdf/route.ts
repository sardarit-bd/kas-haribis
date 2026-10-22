import { getRequestEmail } from '../../../lib/request-auth';
import { canAccessSection } from '../../../lib/admin-access';
import { ensureBanks } from '../../../lib/directories';

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 MB

function isPdfMagicBytes(bytes: Uint8Array): boolean {
  // %PDF- is 0x25, 0x50, 0x44, 0x46, 0x2D
  if (bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
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

  const bank = (await env.DB.prepare('SELECT id, title, report_pdf_key FROM banks WHERE id=?')
    .bind(bankId)
    .first()) as { id: string; title: string; report_pdf_key: string } | null;

  if (!bank) {
    return Response.json(
      { error: 'Bank record not found. Please save the bank entry first before uploading a PDF report.' },
      { status: 404 },
    );
  }

  if (!(file instanceof File) || !file.size) {
    return Response.json({ error: 'Please select a valid PDF file to upload.' }, { status: 400 });
  }

  if (file.size > MAX_PDF_SIZE) {
    return Response.json(
      { error: `The uploaded PDF exceeds the 25 MB limit (file size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).` },
      { status: 400 },
    );
  }

  const fileName = String(file.name || 'report.pdf').trim();
  const lowerName = fileName.toLowerCase();
  if (!lowerName.endsWith('.pdf')) {
    return Response.json(
      { error: 'Invalid file extension. Only .pdf files are accepted.' },
      { status: 400 },
    );
  }

  const mime = (file.type || '').toLowerCase();
  if (mime && mime !== 'application/pdf' && mime !== 'application/x-pdf') {
    return Response.json(
      { error: `Invalid MIME type (${file.type}). Only application/pdf files are accepted.` },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 10));

  if (!isPdfMagicBytes(headerBytes)) {
    return Response.json(
      { error: 'Invalid file format. The file does not have a valid PDF signature (%PDF-).' },
      { status: 400 },
    );
  }

  // Bank-scoped object key in Cloudflare R2
  const key = `bank-reports/${bankId}/report.pdf`;
  await env.BUCKET.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: 'application/pdf',
      contentDisposition: `inline; filename="${fileName.replace(/["\r\n]/g, '')}"`,
    },
  });

  await env.DB.prepare(
    'UPDATE banks SET report_pdf_key=?, report_pdf_name=? WHERE id=?',
  )
    .bind(key, fileName.slice(0, 250), bankId)
    .run();

  return Response.json({
    saved: true,
    bankId,
    name: fileName,
    key,
  });
}

export async function DELETE(request: Request) {
  const { env } = await import('cloudflare:workers');
  const email = await getRequestEmail(request);
  if (!(await canAccessSection(env.DB, email, 'banks'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureBanks(env.DB);
  const url = new URL(request.url);
  let bankId = url.searchParams.get('bankId') || url.searchParams.get('id') || '';

  if (!bankId && request.headers.get('content-type')?.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as any;
    bankId = body.bankId || body.id || '';
  }

  if (!bankId) {
    return Response.json({ error: 'Bank ID is required.' }, { status: 400 });
  }

  const bank = (await env.DB.prepare(
    'SELECT id, report_pdf_key, report_pdf_name FROM banks WHERE id=?',
  )
    .bind(bankId)
    .first()) as { id: string; report_pdf_key: string; report_pdf_name: string } | null;

  if (!bank) {
    return Response.json({ error: 'Bank record not found.' }, { status: 404 });
  }

  if (bank.report_pdf_key) {
    try {
      await env.BUCKET.delete(bank.report_pdf_key);
    } catch {
      // Ignore background delete error if object is already gone
    }
  }

  await env.DB.prepare(
    'UPDATE banks SET report_pdf_key="", report_pdf_name="" WHERE id=?',
  )
    .bind(bankId)
    .run();

  return Response.json({ deleted: true, bankId });
}
