import { notFound } from 'next/navigation';
import { ensureArticles } from '../../../lib/directories';

export const dynamic = 'force-dynamic';

export default async function ArticlePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    { env } = await import('cloudflare:workers');
  await ensureArticles(env.DB);
  const article = (await env.DB.prepare(
    'SELECT id,title,pdf_url FROM articles WHERE id=? AND published=1',
  )
    .bind(id)
    .first()) as any;
  if (!article?.pdf_url) notFound();
  return (
    <main className="articlePdfViewer">
      <header>
        <a
          className="articlePdfBack"
          href={`/articles/${encodeURIComponent(article.id)}`}
        >
          ← Back to article
        </a>
        <div>
          <small>ARTICLE PDF</small>
          <strong>{article.title}</strong>
        </div>
        <a className="articlePdfDownload" href={article.pdf_url} download>
          Download PDF
        </a>
      </header>
      <iframe
        title={`${article.title} PDF`}
        src={`${article.pdf_url}#view=FitH&toolbar=1`}
      />
    </main>
  );
}
