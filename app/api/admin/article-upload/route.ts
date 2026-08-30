import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { PDFDocument } from 'pdf-lib';
import { ensureArticles } from '../../../lib/directories';
export async function POST(r: Request) {
  if (
    !(await isOwnerRequest(r))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    f = await r.formData(),
    file = f.get('file'),
    id = String(f.get('id') || '');
  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Save the article before uploading its PDF.' },
      { status: 400 },
    );
  if (file.type !== 'application/pdf' || file.size > 20 * 1024 * 1024)
    return Response.json(
      { error: 'Choose a PDF up to 20 MB.' },
      { status: 400 },
    );
  try {
    const bytes = await file.arrayBuffer(),
      pdf = await PDFDocument.load(bytes),
      pageCount = pdf.getPageCount();
    await ensureArticles(env.DB);
    await env.BUCKET.put(`articles/${id}.pdf`, bytes, {
      httpMetadata: { contentType: 'application/pdf' },
    });
    const pdfUrl = `/api/article-file?id=${encodeURIComponent(id)}&v=${Date.now()}`;
    await env.DB.prepare(
      'UPDATE articles SET pdf_url=?,page_count=?,updated_at=? WHERE id=?',
    )
      .bind(pdfUrl, pageCount, new Date().toISOString(), id)
      .run();
    return Response.json({ saved: true, pdfUrl, pageCount });
  } catch {
    return Response.json(
      { error: 'This file is not a valid PDF.' },
      { status: 400 },
    );
  }
}
