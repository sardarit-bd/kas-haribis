import { notFound } from 'next/navigation';
import { InteriorPage } from '../../shared/site-shell';
import { ensureArticles } from '../../lib/directories';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    { env } = await import('cloudflare:workers');
  await ensureArticles(env.DB);
  const x = (await env.DB.prepare(
    'SELECT * FROM articles WHERE id=? AND published=1',
  )
    .bind(id)
    .first()) as any;
  if (!x) notFound();
  const original = x.pdf_url?.match(/^\/article-pdfs\/(\d+)\.pdf$/)?.[1];
  const sourceMismatch = original === '798';
  const pages = original
    ? Array.from(
        { length: sourceMismatch ? 1 : Number(x.page_count) || 2 },
        (_, i) => `/article-pages/${original}-${i + 1}.jpg`,
      )
    : [];
  return (
    <InteriorPage
      eyebrow="KAV HARIBIS PUBLICATION"
      title={x.title}
      intro={x.summary || 'A concise publication on practical Hilchos Ribbis.'}
    >
      <section className="articleReader">
        <div className="readerHeading">
          <div>
            <span>
              {sourceMismatch
                ? '1 page available'
                : `${x.page_count || 2} pages`}
            </span>
            {x.publication_date && (
              <time dateTime={x.publication_date}>
                {new Date(`${x.publication_date}T00:00:00`).toLocaleDateString(
                  'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' },
                )}
              </time>
            )}
            <b>{x.author || 'Kav Haribis'}</b>
          </div>
          <div>
            <a href="/articles">← All articles</a>
            {!sourceMismatch && (
              <a
                className="primary"
                href={x.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open or download PDF
              </a>
            )}
          </div>
        </div>
        {sourceMismatch && (
          <p className="articleSourceNotice">
            The former website contains the correct first page but links this
            title to a different publication’s PDF. Upload the correct Tezaveh
            PDF in the Articles administrator to complete this issue.
          </p>
        )}
        {pages.length ? (
          <div className="articlePageStack">
            {pages.map((src, i) => (
              <figure key={src}>
                <img src={src} alt={`${x.title}, page ${i + 1}`} />
                <figcaption>
                  Page {i + 1} of {pages.length}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <iframe title={x.title} src={`${x.pdf_url}#view=FitH&toolbar=1`} />
        )}
      </section>
    </InteriorPage>
  );
}
