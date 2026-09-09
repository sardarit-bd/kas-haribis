import BottomCTA from '../componnent/BottomCTA';
import { listInvestments } from '../lib/directories';
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
      <section className="p-6 sm:p-10 bg-[#f7f3ea]" id="investment-opportunities">
        <div className="container flex items-end justify-between gap-6 mb-10 pb-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">CURRENT LISTINGS</p>
            <h2 className="text-[#102a43] font-serif font-bold text-3xl sm:text-4xl">Available opportunities</h2>
          </div>
          <strong className="min-w-[145px] text-center p-4 bg-white block font-serif text-3xl font-bold text-[#c69b46]">
            {items.length}
            <small className="block text-[10px] font-mono font-normal uppercase tracking-widest text-[#64748b] mt-1">published</small>
          </strong>
        </div>
        {items.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((x) => (
              <article
                className={`p-6 bg-white border border-[#dedfdc] rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 ${
                  x.featured ? 'border-t-4 border-t-[#c69b46]' : ''
                }`}
                key={x.id}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[72px_1fr_auto] gap-4 items-center pb-4 border-b border-[#e3e7e8]">
                    {x.logo_url ? (
                      <img
                        src={x.logo_url}
                        alt={`${x.sponsor_name || x.opportunity_name} logo`}
                        className="w-[72px] h-[64px] object-contain rounded-xl p-1 bg-[#f3f5f3] border border-[#e2e8f0]"
                      />
                    ) : (
                      <span className="w-[72px] h-[64px] rounded-xl bg-[#102a43] text-[#e4c373] font-serif text-2xl font-bold flex items-center justify-center">
                        {String(x.sponsor_name || x.opportunity_name || 'IO')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                    <div>
                      <small className="block text-[10px] font-extrabold text-[#a0772d] uppercase tracking-wider">
                        {x.investment_type || 'Investment opportunity'}
                      </small>
                      <h3 className="text-xl font-serif font-bold text-[#102a43] leading-snug">{x.opportunity_name}</h3>
                      {x.sponsor_name && <b className="text-xs text-[#657383] font-medium block mt-0.5">Presented by {x.sponsor_name}</b>}
                    </div>
                    <em className="not-italic px-3 py-1 bg-[#e9f4eb] text-[#367448] rounded-full text-xs font-bold uppercase tracking-wider w-max sm:self-start">
                      {x.availability_status || 'Open'}
                    </em>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {x.description ||
                      'Opportunity details are available from the sponsor.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                    {x.minimum_investment && (
                      <div className="p-3 bg-[#f5f3ed] rounded-xl">
                        <small className="block text-[9px] font-bold text-[#9a742d] uppercase tracking-wider">MINIMUM</small>
                        <strong className="block text-sm font-bold text-[#102a43] mt-0.5">{x.minimum_investment}</strong>
                      </div>
                    )}
                    {x.return_information && (
                      <div className="p-3 bg-[#f5f3ed] rounded-xl">
                        <small className="block text-[9px] font-bold text-[#9a742d] uppercase tracking-wider">RETURN INFORMATION</small>
                        <strong className="block text-sm font-bold text-[#102a43] mt-0.5">{x.return_information}</strong>
                      </div>
                    )}
                    {x.investment_term && (
                      <div className="p-3 bg-[#f5f3ed] rounded-xl">
                        <small className="block text-[9px] font-bold text-[#9a742d] uppercase tracking-wider">TERM</small>
                        <strong className="block text-sm font-bold text-[#102a43] mt-0.5">{x.investment_term}</strong>
                      </div>
                    )}
                    {x.location && (
                      <div className="p-3 bg-[#f5f3ed] rounded-xl">
                        <small className="block text-[9px] font-bold text-[#9a742d] uppercase tracking-wider">LOCATION</small>
                        <strong className="block text-sm font-bold text-[#102a43] mt-0.5">{x.location}</strong>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-[#f0f5f1] border-l-4 border-[#4c895d] rounded-r-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#4d895e] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      <p className="flex-1 m-0">
                        <small className="block text-[9px] font-bold text-[#39734a] uppercase tracking-wider">{x.kosher_status || 'REVIEWED'}</small>
                        <b className="text-xs font-bold text-[#294b34] block">
                          {x.rabbinical_oversight ||
                            'Kosher investment information'}
                        </b>
                      </p>
                      {x.last_reviewed && (
                        <time className="text-[10px] text-[#63736a]">
                          {new Date(
                            `${x.last_reviewed}T00:00:00`,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                    </div>
                    {x.kosher_details && <p className="text-xs text-[#405d48] leading-relaxed pt-1">{x.kosher_details}</p>}
                  </div>
                  {x.public_notes && (
                    <p className="p-3 bg-[#fff7e5] border-l-4 border-[#c69b46] rounded-r-xl text-xs text-[#876622]">{x.public_notes}</p>
                  )}
                  {x.risk_disclosure && (
                    <details className="mt-3 border border-[#e0e3e4] rounded-xl overflow-hidden group">
                      <summary className="p-3 text-xs font-bold text-[#7f6024] cursor-pointer bg-[#f8fafc] group-open:border-b border-[#e0e3e4]">
                        Important risk disclosure
                      </summary>
                      <p className="p-3.5 text-xs text-[#626d78] leading-relaxed">{x.risk_disclosure}</p>
                    </details>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#e5e8e9] text-xs font-bold text-[#c69b46] flex-wrap">
                  {link(x.opportunity_url) ? (
                    <a
                      className="px-4 py-2 bg-[#102a43] hover:bg-[#1a385c] text-white rounded-lg transition-colors text-xs font-bold shadow-sm"
                      href={x.opportunity_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Opportunity ↗
                    </a>
                  ) : (
                    <span className="text-[#7c8790] font-semibold">Details link coming soon</span>
                  )}
                  {x.email && <a href={`mailto:${x.email}`} className="hover:underline">Contact sponsor</a>}
                  {x.phone && (
                    <a href={`tel:${x.phone.replace(/[^+\d]/g, '')}`} className="hover:underline ml-auto">
                      {x.phone}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] rounded-2xl max-w-md mx-auto space-y-3">
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
      <BottomCTA eyebrow={"PLEASE NOTE"} title={"Halachic review and financial due diligence are both essential"} discription={"Investment opportunities involve risk, including possible loss of principal. Confirm all current terms, investigate the sponsor independently, review offering documents with your advisers, and ask a qualified Rav about your circumstances."} link="/bais-horaah" linktext="Ask a halachic question →" link2="" link2text=""/>
      <SiteFooter/>

    </>
  );
}
