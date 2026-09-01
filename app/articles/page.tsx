import { listArticles } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
export default async function ArticlesPage() {
  const { env } = await import('cloudflare:workers'),
    items = (await listArticles(env.DB)) as any[];
  return (
    <InteriorPage
      eyebrow="ARTICLES & GILYONOS"
      title="Practical Torah guidance for modern financial life"
      intro="Browse the complete Kav Haribis collection of concise publications on practical questions in Hilchos Ribbis."
    >
      <div className='hidden'>
      <section className="articleCollectionIntro">
        <div>
          <p className="eyebrow gold">THE KAV HARIBIS GILYON</p>
          <h2>Clear guidance designed to be read, shared, and remembered</h2>
          <p>
            Each publication presents timely Torah guidance in a concise format.
            Open an issue to read every page directly on the site or download
            the original PDF.
          </p>
        </div>
        <aside>
          <strong>{items.length}</strong>
          <span>complete publications</span>
          <small>Original publications preserved in full</small>
        </aside>
      </section>
      </div>
      <section className="articleLibrary">
        <div className="articleLibraryHead">
          <div>
            <p className="eyebrow gold">COMPLETE ARCHIVE</p>
            <h2>Latest publications</h2>
          </div>
          <p>
            Newest issues appear first. Every page is displayed without
            cropping.
          </p>
        </div>
        <div className="modernArticleGrid">
          {items.map((x, index) => (
            <article className={x.featured ? 'featured' : ''} key={x.id}>
              <a
                className="articleCover"
                href={`/articles/${encodeURIComponent(x.id)}`}
              >
                {x.cover_url ? (
                  <img src={x.cover_url} alt={`First page of ${x.title}`} />
                ) : (
                  <div>
                    <span>קו הריבית</span>
                    <b>{x.title}</b>
                  </div>
                )}
                <i>{x.page_count || 2} PAGES</i>
              </a>
              <div className="articleCardBody">
                <div className="articleMeta">
                  <time dateTime={x.publication_date}>
                    {x.publication_date
                      ? new Date(
                          `${x.publication_date}T00:00:00`,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Kav Haribis'}
                  </time>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 dir={/[֐-׿]/.test(x.title) ? 'rtl' : 'ltr'}>{x.title}</h3>
                {x.hebrew_title && <h4 dir="rtl">{x.hebrew_title}</h4>}
                <p>
                  {x.summary ||
                    'A concise Kav Haribis publication about practical Hilchos Ribbis.'}
                </p>
                <div>
                  <a
                    className="primary"
                    href={`/articles/${encodeURIComponent(x.id)}`}
                  >
                    Read all {x.page_count || 2} pages
                  </a>
                  <a href={x.pdf_url} target="_blank" rel="noopener noreferrer">
                    Open PDF ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="articleCallout my-10">
        <div>
          <p className="eyebrow">STAY INFORMED</p>
          <h2>Bring practical Hilchos Ribbis into your home and business</h2>
          <p>
            Read the latest gilyonos and share them with family, colleagues, and
            community members.
          </p>
        </div>
        <a href="/contact">Receive publication updates →</a>
      </section>
    </InteriorPage>
  );
}
