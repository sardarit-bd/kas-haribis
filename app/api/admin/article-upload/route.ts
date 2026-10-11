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
    cover = f.get('cover'),
    id = String(f.get('id') || '');
  if (!(file instanceof File) || !id)
    return Response.json(
      { error: 'Save the article before uploading its PDF.' },
      { status: 400 },
    );
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return Response.json({ error: 'Invalid article ID.' }, { status: 400 });
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

    let coverUrl: string | null = null;
    if (cover instanceof File && cover.size > 0 && cover.size <= 5 * 1024 * 1024) {
      const coverBytes = await cover.arrayBuffer();
      const contentType = cover.type.startsWith('image/') ? cover.type : 'image/jpeg';
      await env.BUCKET.put(`articles/covers/${id}.jpg`, coverBytes, {
        httpMetadata: { contentType },
      });
      coverUrl = `/api/article-cover?id=${encodeURIComponent(id)}&v=${Date.now()}`;
    }

    const now = new Date().toISOString();
    if (coverUrl) {
      await env.DB.prepare(
        'UPDATE articles SET pdf_url=?,cover_url=?,page_count=?,updated_at=? WHERE id=?',
      )
        .bind(pdfUrl, coverUrl, pageCount, now, id)
        .run();
    } else {
      await env.DB.prepare(
        'UPDATE articles SET pdf_url=?,page_count=?,updated_at=? WHERE id=?',
      )
        .bind(pdfUrl, pageCount, now, id)
        .run();
    }
    return Response.json({ saved: true, pdfUrl, coverUrl, pageCount });
  } catch {
    return Response.json(
      { error: 'This file is not a valid PDF.' },
      { status: 400 },
    );
  }
}
