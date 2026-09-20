import BottomCTA from '../componnent/BottomCTA';
import { listLoanServices } from '../lib/directories';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listLoanServices(env.DB)) as any[];
  return (
    <>
    <SiteHeader/>
    
    <InteriorPage
      eyebrow="HALACHICALLY RESPONSIBLE FINANCING"
      title="Kosher Loan Services"
      intro="Reliable brokers. Kosher deals. Peace of mind. Connect with professionals who understand the importance of arranging financing in accordance with Hilchos Ribbis."
    />

      {/* Join the Revolution Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container max-w-[1320px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              Join the Revolution in Helping Klal Yisroel Avoid Ribis
            </h2>
            <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
              We’re here to connect you with professionals who uphold and respect halachic financial guidelines.
            </p>
            <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed pt-1">
              Navigating the world of loans while staying fully within halacha can be complex. That’s why we’ve partnered with trusted brokers who understand the importance of working only with truly kosher loan structures — including proper heter iska where needed.
            </p>
          </div>
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] overflow-hidden shadow-lg border border-slate-100">
              <img
                src="/loan-approved-office.jpg"
                alt="Loan Approved - Join the Revolution in Helping Klal Yisroel Avoid Ribis"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 bg-[#f7f3ea]" id="loan-services">
        <div className="container px-8 flex flex-col md:flex-row items-center md:items-center justify-center gap-6 mb-10 pb-6 text-center">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-[#102a43] font-serif font-bold text-3xl sm:text-4xl">Featured loan services</h2>
            <p className="text-[#64748b] text-sm sm:text-base leading-relaxed">
              Each listing includes the information currently available to Kav
              Haribis. Always verify the details before relying on a listing.
            </p>
          </div>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
          {items.map((x, i) => (
            <article
              className={`p-6 bg-white flex flex-col justify-between space-y-4 ${
                x.featured ? 'border-t-4 border-t-[#c69b46]' : ''
              }`}
              key={x.id}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
                  <div className="w-16 h-14 rounded-xl p-2 bg-[#f4f6f8] border border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0">
                    {x.logo_url ? (
                      <img src={x.logo_url} alt={`${x.name} logo`} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-serif font-bold text-xl text-[#102a43]">{x.name.charAt(0)}</span>
                    )}
                  </div>
                  <small className="font-mono text-xs font-bold text-[#94a3b8]">{String(i + 1).padStart(2, '0')}</small>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e9f4eb] text-[#367448] border border-[#c5e1cd] rounded-full text-xs font-bold w-max">
                  <i className="not-italic font-bold">✓</i>
                  {x.verification_status || 'Listed service'}
                </div>

                <h3 className="text-3xl font-serif font-meduim text-[#102a43] leading-snug">{x.name}</h3>

                {x.service_type && <b className="block text-base text-[#c69b46] uppercase tracking-wider">{x.service_type}</b>}

                <p className="text-base text-gray-600 leading-relaxed">{x.description}</p>

                {x.specialties && (
                  <p className="text-xs text-[#64748b]">
                    <b className="font-semibold text-[#102a43]">Specialties:</b> {x.specialties}
                  </p>
                )}

                {x.rabbinical_oversight && (
                  <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0]">
                    <small className="block text-sm font-meduim text-[#c69b46] uppercase tracking-wider">RABBINICAL OVERSIGHT</small>
                    <b className="text-md text-[#102a43] font-medium block mt-0.5">{x.rabbinical_oversight}</b>
                  </div>
                )}

                {x.kosher_details && (
                  <p className="p-3 bg-[#e9f4eb]/60 border-l-4 border-[#367448] text-sm text-[#294b34] leading-relaxed">{x.kosher_details}</p>
                )}

                <dl className="grid grid-cols-[110px_1fr] gap-2 text-xs py-2 border-y border-[#f1f5f9]">
                  {x.contact_name && (
                    <>
                      <dt className="font-semibold text-[#9b762e] uppercase tracking-wider text-[12px]">Contact</dt>
                      <dd className="m-0 text-[#405469] text-sm font-medium">{x.contact_name}</dd>
                    </>
                  )}
                  {(x.city || x.state) && (
                    <>
                      <dt className="font-semibold text-[#9b762e] uppercase tracking-wider text-[12px]">Location</dt>
                      <dd className="m-0 text-[#405469] text-sm font-medium">{[x.city, x.state].filter(Boolean).join(', ')}</dd>
                    </>
                  )}
                  {x.service_area && (
                    <>
                      <dt className="font-semibold text-[#9b762e] uppercase tracking-wider text-[12px]">Service area</dt>
                      <dd className="m-0 text-[#405469] text-sm font-medium">{x.service_area}</dd>
                    </>
                  )}
                </dl>

                {x.public_notes && (
                  <p className="p-3 bg-[#fff7e5] border-l-4 border-[#c69b46] rounded-r-xl text-xs text-[#876622]">{x.public_notes}</p>
                )}

                {x.last_verified && (
                  <time className="block text-[11px] text-[#94a3b8]" dateTime={x.last_verified}>
                    Last verified:{' '}
                    {new Date(`${x.last_verified}T00:00:00`).toLocaleDateString(
                      'en-US',
                    )}
                  </time>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#f1f5f9] text-xs font-bold text-[#c69b46] flex-wrap">
                {x.phone && (
                  <a style={{color:"white"}} className="px-4 py-2 bg-[#102a43] hover:bg-[#1a385c] text-white transition-colors text-sm font-meduim shadow-sm" href={`tel:${x.phone}`}>
                    Call {x.phone}
                  </a>
                )}
                {x.email && <a href={`mailto:${x.email}`} className="hover:underline">Email</a>}
                {x.website && (
                  <a
                    href={
                      x.website.startsWith('http')
                        ? x.website
                        : `https://${x.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline ml-auto text-sm font-meduim"
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 && (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] rounded-2xl max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Listings are being prepared</h3>
            <p className="text-sm text-[#64748b]">Please contact Kav Haribis for guidance in the meantime.</p>
          </div>
        )}
      </section>

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"IMPORTANT"} title={"Every loan must be reviewed individually"} discription={"A listed broker or service does not automatically make every transaction permissible. The lender, funding source, documents, and Heter Iska must be appropriate for the specific loan."} link="/bais-horaah" linktext="Review your loan with the Bais Horaah" link2="" link2text=""/>
      <SiteFooter/>
    </>
  );
}
