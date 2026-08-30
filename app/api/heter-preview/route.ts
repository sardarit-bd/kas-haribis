import { ensureHeterTables } from '../../lib/heter-documents';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const document = (await env.DB.prepare(
    'SELECT filename,storage_key FROM heter_documents WHERE id=? AND active=1',
  )
    .bind(id)
    .first()) as { filename?: string; storage_key?: string } | null;
  if (!document?.storage_key)
    return new Response('Document not found', { status: 404 });
  const previewKey = `heter-preview/${id}.pdf`;
  let preview = await env.BUCKET.get(previewKey);

  if (!preview) {
    const original = await env.BUCKET.get(document.storage_key);
    if (!original)
      return new Response('Document file not found', { status: 404 });
    try {
      const pdf = await PDFDocument.load(await original.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const watermark = 'NOT PAID - PREVIEW ONLY';
        const size = Math.max(25, Math.min(50, width / 10));
        const textWidth = font.widthOfTextAtSize(watermark, size);
        for (const y of [height * 0.2, height * 0.47, height * 0.74]) {
          page.drawText(watermark, {
            x: Math.max(12, (width - textWidth * 0.82) / 2),
            y,
            size,
            font,
            color: rgb(0.68, 0.08, 0.08),
            opacity: 0.22,
            rotate: degrees(28),
          });
        }
        const footer =
          'KAV HARIBIS - UNPAID PREVIEW - CLEAN PDF AVAILABLE AFTER PAYMENT';
        const footerSize = Math.max(7, Math.min(11, width / 55));
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height: 25,
          color: rgb(0.68, 0.08, 0.08),
          opacity: 0.92,
        });
        page.drawText(footer, {
          x: 12,
          y: 8,
          size: footerSize,
          font,
          color: rgb(1, 1, 1),
        });
      }
      const bytes = await pdf.save({ useObjectStreams: true });
      await env.BUCKET.put(previewKey, bytes, {
        httpMetadata: { contentType: 'application/pdf' },
        customMetadata: {
          sourceDocumentId: id,
          watermark: 'NOT PAID - PREVIEW ONLY',
        },
      });
      preview = await env.BUCKET.get(previewKey);
    } catch (error) {
      console.error('Could not create watermarked Heter Iska preview', error);
      return new Response(
        'The protected preview could not be prepared. Please try again.',
        { status: 500 },
      );
    }
  }

  if (!preview)
    return new Response('The protected preview could not be prepared.', {
      status: 500,
    });
  const safeName = (document.filename || 'Heter-Iska.pdf').replaceAll('"', '');
  return new Response(preview.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="NOT-PAID-PREVIEW-${safeName}"`,
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
