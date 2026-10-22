import { isOwnerRequest } from '../../../lib/request-auth';
import { PDFDocument } from 'pdf-lib';
import { ensureArticles } from '../../../lib/directories';

export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { env } = await import('cloudflare:workers'),
    f = await r.formData(),
    file = f.get('file'),
    cover = f.get('cover'),
    id = String(f.get('id') || '');

  if (!id || !/^[a-zA-Z0-9-]{1,80}$/.test(id))
    return Response.json({ error: 'Invalid article ID.' }, { status: 400 });

  await ensureArticles(env.DB);

  const hasFile = file instanceof File && file.size > 0;
  const isCover =
    cover &&
    (cover instanceof File ||
      (typeof (cover as any).arrayBuffer === 'function' &&
        typeof (cover as any).size === 'number')) &&
    (cover as any).size > 0;

  if (!hasFile && !isCover) {
    return Response.json(
      { error: 'Save the article before uploading its PDF or cover image.' },
      { status: 400 },
    );
  }

  try {
    const now = new Date().toISOString();

    // 1. Cover update only (recovery or manual override for existing article)
    if (!hasFile && isCover) {
      const existing = (await env.DB.prepare(
        'SELECT id, pdf_url FROM articles WHERE id=?',
      )
        .bind(id)
        .first()) as { id: string; pdf_url: string } | null;

      if (!existing) {
        return Response.json({ error: 'Article not found.' }, { status: 404 });
      }

      const coverBlob = cover as Blob;
      if (coverBlob.size > 5 * 1024 * 1024) {
        return Response.json(
          { error: 'Cover image must be 5 MB or smaller.' },
          { status: 400 },
        );
      }

      const rawType = (cover as any).type || '';
      const contentType = rawType.startsWith('image/')
        ? rawType
        : 'image/jpeg';
      const coverBytes = await coverBlob.arrayBuffer();

      await env.BUCKET.put(`articles/covers/${id}.jpg`, coverBytes, {
        httpMetadata: { contentType },
      });

      const coverUrl = `/api/article-cover?id=${encodeURIComponent(id)}&v=${Date.now()}`;
      await env.DB.prepare(
        'UPDATE articles SET cover_url=?, updated_at=? WHERE id=?',
      )
        .bind(coverUrl, now, id)
        .run();

      return Response.json({ saved: true, coverUrl });
    }

    // 2. Full PDF upload (with optional or generated cover)
    const pdfFile = file as File;
    if (
      (pdfFile.type !== 'application/pdf' &&
        !pdfFile.name.toLowerCase().endsWith('.pdf')) ||
      pdfFile.size > 20 * 1024 * 1024
    ) {
      return Response.json(
        { error: 'Choose a PDF up to 20 MB.' },
        { status: 400 },
      );
    }

    const bytes = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pageCount = pdf.getPageCount();

    await env.BUCKET.put(`articles/${id}.pdf`, bytes, {
      httpMetadata: { contentType: 'application/pdf' },
    });
    const pdfUrl = `/api/article-file?id=${encodeURIComponent(id)}&v=${Date.now()}`;

    let coverUrl: string | null = null;
    if (isCover) {
      const coverBlob = cover as Blob;
      if (coverBlob.size <= 5 * 1024 * 1024) {
        const coverBytes = await coverBlob.arrayBuffer();
        const rawType = (cover as any).type || '';
        const contentType = rawType.startsWith('image/')
          ? rawType
          : 'image/jpeg';
        await env.BUCKET.put(`articles/covers/${id}.jpg`, coverBytes, {
          httpMetadata: { contentType },
        });
        coverUrl = `/api/article-cover?id=${encodeURIComponent(id)}&v=${Date.now()}`;
      }
    }

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
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'This file is not a valid PDF.' },
      { status: 400 },
    );
  }
}
