import BottomCTA from '../componnent/BottomCTA';
import { listArticles } from '../lib/directories';
import { MotionArticle, MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const { env } = await import('cloudflare:workers');
  const items = (await listArticles(env.DB)) as any[];
  return (
    <>
      <SiteHeader/>
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <InteriorPage
          eyebrow="ARTICLES & GILYONOS"
          title="Practical Torah guidance for modern financial life"
          intro="Browse the complete Kav Haribis collection of concise publications on practical questions in Hilchos Ribbis."
        />
      </MotionDiv>
     
      <section className="w-full bg-[#f7f3ea] py-10 overflow-hidden">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="container px-8"
        >
          <div>
            <p className="text-[#c69b46] text-xs font-bold tracking-widest uppercase mb-2 hidden">COMPLETE ARCHIVE</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-700 tracking-tight mb-2">Latest publications</h2>
          </div>
          <p className="text-gray-600 text-base max-w-2xl">
            Newest issues appear first. Every page is displayed without
            cropping.
          </p>
        </MotionDiv>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container px-4 lg:px-8 pt-10">
          {items.map((x, index) => (
            <MotionArticle
              initial={{ opacity: 0, y: 15,scale:.9 }}
              whileInView={{ opacity: 1, y: 0,scale:1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-white overflow-hidden flex flex-col rounded-xl shadow-xs hover:shadow-md ${x.featured ? 'border-[#c69b46] ring-1 ring-[#c69b46]/40' : 'border-slate-200/90'}`}
              key={x.id}
            >
              <a
                className="relative bg-[#070f1e] flex items-center justify-center text-center border-b border-slate-200 overflow-hidden group aspect-[696/900] w-full"
                style={{ aspectRatio: '696 / 900' }}
                href={`/articles/${encodeURIComponent(x.id)}`}
              >
                {x.cover_url ? (
                  <img src={x.cover_url} alt={`First page of ${x.title}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#102a43] via-[#0b1d30] to-[#071524] text-center select-none relative overflow-hidden group-hover:brightness-105 transition duration-300">
                    {/* Decorative traditional border frame */}
                    <div className="absolute inset-2 sm:inset-3 border border-[#c69b46]/35 rounded pointer-events-none" />
                    <div className="absolute inset-2.5 sm:inset-3.5 border border-[#c69b46]/15 rounded pointer-events-none" />

                    {/* Top Header */}
                    <div className="relative pt-2 sm:pt-3 z-10">
                      <span className="block text-[#c69b46] font-serif text-2xl sm:text-3xl font-bold tracking-wide drop-shadow-sm">
                        קו הריבית
                      </span>
                      <span className="block text-[#d4af37]/80 text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase mt-1">
                        Center for Hilchos Ribbis
                      </span>
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c69b46]/60 to-transparent mx-auto mt-2" />
                    </div>

                    {/* Center Title / Parsha */}
                    <div className="relative my-auto py-3 px-3 sm:px-4 z-10 flex flex-col items-center justify-center">
                      {x.hebrew_title && (
                        <h4
                          className="text-lg sm:text-xl font-serif font-bold text-[#e8c87e] leading-snug mb-2 line-clamp-2 drop-shadow-sm"
                          dir="rtl"
                        >
                          {x.hebrew_title}
                        </h4>
                      )}
                      <p
                        className="text-sm sm:text-base font-serif font-semibold text-white/95 leading-snug line-clamp-4"
                        dir={/[֐-׿]/.test(x.title) ? 'rtl' : 'ltr'}
                      >
                        {x.title}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative pb-2 sm:pb-3 z-10">
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c69b46]/60 to-transparent mx-auto mb-2" />
                      <span className="inline-block text-[#94a3b8] text-[11px] sm:text-xs font-sans font-medium">
                        {x.publication_date
                          ? new Date(`${x.publication_date}T00:00:00`).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Torah Publication'}
                      </span>
                      <span className="block text-[#c69b46]/90 text-[10px] font-sans font-semibold uppercase tracking-wider mt-0.5">
                        Official Publication
                      </span>
                    </div>
                  </div>
                )}
                <i className="absolute bottom-3 right-3 not-italic bg-[#0f172a]/90 border border-slate-700 text-[#c69b46] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow hidden">
                  {x.page_count || 2} PAGES
                </i>
              </a>
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between gap-2 text-base text-slate-500 mb-3">
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
                    <span className="font-mono text-base text-[#a37828] font-meduim">#{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="pt-3 text-2xl font-serif font-meduim text-gray-700 mb-1.5 leading-snug" dir={/[֐-׿]/.test(x.title) ? 'rtl' : 'ltr'}>{x.title}</h3>
                  {x.hebrew_title && <h4 className="text-base font-serif text-[#a37828] mb-3" dir="rtl">{x.hebrew_title}</h4>}
                  <p className="text-slate-600 text-base mb-6 leading-relaxed line-clamp-3">
                    {x.summary ||
                      'A concise Kav Haribis publication about practical Hilchos Ribbis.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 mt-auto">
                  <a
                    style={{ color: 'white' }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#c69b46] hover:bg-[#b58a35] text-white font-medium text-base tracking-wide transition shadow-sm rounded-md hover:scale-[1.02]"
                    href={`/articles/${encodeURIComponent(x.id)}`}
                  >
                    Read all {x.page_count || 2} pages
                  </a>
                  <a
                    style={{ color: 'white' }}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2.5 text-slate-200 hover:text-white font-medium text-base transition bg-slate-800/40 rounded-md hover:scale-[1.02]"
                    href={x.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open PDF
                  </a>
                </div>
              </div>
            </MotionArticle>
          ))}
        </div>
      </section>

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"STAY INFORMED"} title={"Receive publication updates"} discription={"Receive the complete Kav Haribis collection of concise publications on practical questions in Hilchos Ribbis."} link="/contact" linktext="Receive publication updates" link2="" link2text=""/>
      <SiteFooter/>
    </>
  );
}


