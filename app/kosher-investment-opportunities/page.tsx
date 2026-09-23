import BottomCTA from '../componnent/BottomCTA';
import { listInvestments } from '../lib/directories';
import { MotionArticle, MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
const link = (x: string) => (/^https?:\/\//i.test(x || '') ? x : '');
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listInvestments(env.DB)) as any[];
  return (
    <>
    <SiteHeader/>
    <InteriorPage
      eyebrow="KOSHER INVESTING"
      title="Kosher Investment Opportunities"
      intro="Explore investment opportunities together with the practical halachic information and disclosures provided for each listing."
    />
      <div className='hidden'>
      <section className="investHero">
        <div>
          <p className="eyebrow gold">INVEST WITH CLARITY</p>
          <h2>Opportunity information designed for responsible review</h2>
          <p>
            Compare the structure, minimum investment, term, kosher-review
            details, and sponsor information before deciding what deserves
            further due diligence.
          </p>
        </div>
        <aside>
          <span>◆</span>
          <h3>Review before investing</h3>
          <p>
            A listing is educational information—not an endorsement, guarantee,
            or personal investment recommendation.
          </p>
        </aside>
      </section>
      </div>
      <section className="py-6 sm:py-10 bg-gray-200" id="investment-opportunities">
        {items.length ? (
          <div className="container max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8">
            {items.map((x, i) => (
              <MotionArticle
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white border border-slate-200/90 shadow-sm transition-shadow duration-300 hover:shadow-xl flex flex-col justify-between group ${
                  x.featured ? 'border-2 border-[#c69b46]' : ''
                }`}
                key={x.id}
              >
                <div>
                  {/* Full-width Image Header */}
                  <div className="relative w-full h-48 sm:h-52 bg-[#0d2238] overflow-hidden border-b border-slate-100 flex items-center justify-center shrink-0">
                    {x.logo_url ? (
                      <img
                        src={x.logo_url}
                        alt={`${x.sponsor_name || x.opportunity_name} logo`}
                        className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div>
                      </div>
                    )}

                    {/* Minimal Badges */}
                    <em className="absolute top-3 right-3 not-italic px-2.5 py-0.5 bg-[#102a43]/85 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider rounded-xl">
                      {x.availability_status || 'Open'}
                    </em>
                    {x.featured && (
                      <span className="absolute top-3 left-3 bg-[#c69b46] text-white px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div>
                      <span className="text-[#c69b46] font-meduim text-[15px] block mb-1">
                        {x.investment_type || 'Investment opportunity'}
                      </span>
                      <h3 className="text-lg sm:text-3xl font-serif font-bold text-[#102a43] leading-snug group-hover:text-[#a37828] transition-colors">
                        {x.opportunity_name}
                      </h3>
                      {x.sponsor_name && (
                        <span className="text-xs text-slate-500 font-medium block mt-1">
                          Presented by {x.sponsor_name}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-base text-slate-600 leading-relaxed line-clamp-2">
                      {x.description ||
                        'Opportunity details are available from the sponsor.'}
                    </p>

                    {/* Clean Key Metrics Divider Grid (Lightweight, No Bulky Boxes) */}
                    <div className="border-t border-b border-slate-100 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs my-2">
                      {x.minimum_investment && (
                        <div>
                          <span className="text-[13px] font-semibold text-slate-400 block">
                            Minimum
                          </span>
                          <strong className="font-bold text-[#102a43] text-xs block truncate" title={x.minimum_investment}>
                            {x.minimum_investment}
                          </strong>
                        </div>
                      )}
                      {x.return_information && (
                        <div>
                          <span className="text-[13px] font-semibold text-slate-400 block">
                            Return
                          </span>
                          <strong className="font-bold text-[#102a43] text-xs block truncate" title={x.return_information}>
                            {x.return_information}
                          </strong>
                        </div>
                      )}
                      {x.investment_term && (
                        <div>
                          <span className="text-[13px] font-semibold text-slate-400 block">
                            Term
                          </span>
                          <strong className="font-bold text-[#102a43] text-xs block truncate" title={x.investment_term}>
                            {x.investment_term}
                          </strong>
                        </div>
                      )}
                      {x.location && (
                        <div>
                          <span className="text-[13px] font-semibold text-slate-400 block">
                            Location
                          </span>
                          <strong className="font-bold text-[#102a43] text-xs block truncate" title={x.location}>
                            {x.location}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Natural Halachic Review Bar */}
                    <div className="flex items-start gap-2.5 text-xs bg-[#f4f8f5] p-3 border-l-2 border-[#4c895e]">
                      <span className="text-[#367448] font-bold text-sm leading-none shrink-0 mt-0.5">✓</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="font-bold text-[11px] uppercase text-[#367448] tracking-wider">
                            {x.kosher_status || 'REVIEWED'}
                          </strong>
                          {x.last_reviewed && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(`${x.last_reviewed}T00:00:00`).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">
                          {x.rabbinical_oversight || 'Kosher investment information'}
                        </p>
                      </div>
                    </div>

                    {x.public_notes && (
                      <p className="p-2.5 bg-[#fffdf5] border-l-2 border-[#c69b46] text-xs text-[#876622] leading-relaxed">
                        {x.public_notes}
                      </p>
                    )}

                    {x.risk_disclosure && (
                      <details className="border-t border-slate-100 pt-2 group/disclosure">
                        <summary className="text-xs font-bold text-slate-500 hover:text-[#102a43] cursor-pointer flex items-center justify-between py-1">
                          <span>Important risk disclosure</span>
                          <span className="text-[10px] group-open/disclosure:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="pt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 mt-1">
                          {x.risk_disclosure}
                        </p>
                      </details>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-5 sm:p-6 pt-0 space-y-2.5">
                  {link(x.opportunity_url) ? (
                    <a
                      className="block w-full text-center py-2.5 bg-[#102a43] hover:bg-[#1a385c] text-white transition-all text-xs font-bold shadow-sm"
                      href={x.opportunity_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Opportunity ↗
                    </a>
                  ) : (
                    <div className="text-center py-2 text-slate-400 text-xs bg-slate-50 border border-slate-100">
                      Details link coming soon
                    </div>
                  )}
                  {(x.email || x.phone) && (
                    <div className="flex items-center justify-between text-xs text-[#c69b46] font-semibold pt-1">
                      {x.email ? (
                        <a href={`mailto:${x.email}`} className="hover:underline">
                          Contact sponsor
                        </a>
                      ) : <span />}
                      {x.phone && (
                        <a href={`tel:${x.phone.replace(/[^+\d]/g, '')}`} className="hover:underline ml-auto">
                          {x.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </MotionArticle>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] max-w-md mx-auto space-y-3">
            <span className="text-4xl text-[#c69b46] block">◆</span>
            <h2 className="text-xl font-serif font-bold text-[#102a43]">Opportunities will appear here</h2>
            <p className="text-sm text-[#64748b]">
              Use the administrator to add and publish the first kosher
              investment opportunity.
            </p>
          </div>
        )}
      </section>

      {/* CTA Section Banner */}
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <BottomCTA eyebrow={"PLEASE NOTE"} title={"Halachic review and financial due diligence are both essential"} discription={"Investment opportunities involve risk, including possible loss of principal. Confirm all current terms, investigate the sponsor independently, review offering documents with your advisers, and ask a qualified Rav about your circumstances."} link="/bais-horaah" linktext="Ask a halachic question" link2="" link2text=""/>
      </MotionDiv>
      <SiteFooter/>

    </>
  );
}

