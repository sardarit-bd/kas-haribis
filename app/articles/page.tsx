import BottomCTA from '../componnent/BottomCTA';
import { listArticles } from '../lib/directories';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const { env } = await import('cloudflare:workers');
  const items = (await listArticles(env.DB)) as any[];
  return (
    <>
    <SiteHeader/>
    <InteriorPage
      eyebrow="ARTICLES & GILYONOS"
      title="Practical Torah guidance for modern financial life"
      intro="Browse the complete Kav Haribis collection of concise publications on practical questions in Hilchos Ribbis."
    />
     
      <section className="w-full bg-[#f7f3ea] py-10">
        <div className="mb-10 container">
          <div>
            <p className="text-[#c69b46] text-xs font-bold tracking-widest uppercase mb-2 hidden">COMPLETE ARCHIVE</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-700 tracking-tight mb-2">Latest publications</h2>
          </div>
          <p className="text-gray-600 text-base max-w-2xl">
            Newest issues appear first. Every page is displayed without
            cropping.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container">
          {items.map((x, index) => (
            <article className={`bg-white overflow-hidden transition-all flex flex-col ${x.featured ? 'border-[#c69b46] ring-1 ring-[#c69b46]/40' : 'border-slate-200/90'}`} key={x.id}>
              <a
                className="relative bg-[#070f1e]  flex items-center justify-center text-center border-b border-slate-200 overflow-hidden group"
                href={`/articles/${encodeURIComponent(x.id)}`}
              >
                {x.cover_url ? (
                  <img src={x.cover_url} alt={`First page of ${x.title}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-[#102a43] border border-slate-700 rounded-lg w-full h-full">
                    <span className="text-[#c69b46] font-serif text-2xl font-bold mb-2">קו הריבית</span>
                    <b className="text-slate-100 font-serif text-base line-clamp-3">{x.title}</b>
                  </div>
                )}
                <i className="absolute bottom-3 right-3 not-italic bg-[#0f172a]/90 border border-slate-700 text-[#c69b46] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                  {x.page_count || 2} PAGES
                </i>
              </a>
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
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
                    <span className="font-mono text-[#a37828] font-bold">#{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-700 mb-1.5 leading-snug" dir={/[֐-׿]/.test(x.title) ? 'rtl' : 'ltr'}>{x.title}</h3>
                  {x.hebrew_title && <h4 className="text-base font-serif text-[#a37828] mb-3" dir="rtl">{x.hebrew_title}</h4>}
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {x.summary ||
                      'A concise Kav Haribis publication about practical Hilchos Ribbis.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 mt-auto">
                  <a
                    style={{ color: 'white' }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#c69b46] hover:bg-[#b58a35] text-white font-bold text-xs tracking-wide transition shadow-sm"
                    href={`/articles/${encodeURIComponent(x.id)}`}
                  >
                    Read all {x.page_count || 2} pages
                  </a>
                  <a
                    style={{ color: 'white' }}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2.5 text-slate-200 hover:text-white font-medium text-xs transition bg-slate-800/40"
                    href={x.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open PDF ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"STAY INFORMED"} title={"Receive publication updates"} discription={"Receive the complete Kav Haribis collection of concise publications on practical questions in Hilchos Ribbis."} link="/contact" linktext="Receive publication updates →" link2="" link2text=""/>
      <SiteFooter/>
    </>
  );
}

