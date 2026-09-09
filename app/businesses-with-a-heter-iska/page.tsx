import BottomCTA from '../componnent/BottomCTA';
import { listBusinesses } from '../lib/directories';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';
export default async function BusinessesPage() {
  const { env } = await import('cloudflare:workers');
  const businesses = (await listBusinesses(env.DB)) as any[];
  return (
    <>
     <SiteHeader />
    <InteriorPage
      eyebrow="KOSHER COMMERCE DIRECTORY"
      title="Businesses With a Heter Iska"
      intro="A growing directory of businesses listed by Kav Haribis as operating with a Heter Iska. Review the information and confirm that the document remains current before relying on a listing."
    />
      <section className=" p-6 sm:p-10 bg-[#f7f3ea]" id="business-directory">
        <div className="container flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">DIRECTORY</p>
            <h2 className="text-[#102a43] font-serif font-bold text-3xl sm:text-4xl">Listed businesses</h2>
            <p className="text-[#64748b] text-sm sm:text-base leading-relaxed">
              Each listing reflects information collected by Kav Haribis.
              Documents and business practices can change, so current
              verification is always recommended.
            </p>
          </div>
          <div className="min-w-[160px] text-center p-4 bg-white shrink-0">
            <strong className="block text-3xl sm:text-4xl font-serif font-bold text-[#c69b46]">{businesses.length}</strong>
            <span className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mt-1">businesses currently listed</span>
          </div>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((item, index) => (
            <article key={item.id} className="p-6 bg-white flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
                  <div className="w-16 h-14 rounded-xl p-2 bg-[#f4f6f8] border border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0">
                    {item.logo_url ? (
                      <img src={item.logo_url} alt={`${item.name} logo`} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-serif font-bold text-xl text-[#102a43]">{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <small className="font-mono text-xs font-bold text-[#94a3b8]">{String(index + 1).padStart(2, '0')}</small>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e9f4eb] text-[#367448] border border-[#c5e1cd] rounded-full text-xs font-bold w-max">
                  <i className="not-italic font-bold">✓</i>{' '}
                  {item.verification_status || 'LISTED WITH A HETER ISKA'}
                </div>

                <h3 className="text-xl font-serif font-bold text-[#102a43] leading-snug" dir={/[֐-׿]/.test(item.name) ? 'rtl' : 'ltr'}>{item.name}</h3>

                {item.category && (
                  <small className="block text-xs font-extrabold text-[#c69b46] uppercase tracking-wider">{item.category}</small>
                )}

                <p className="text-sm text-[#475569] leading-relaxed">
                  {item.description ||
                    'Listed in the Kav Haribis Heter Iska business directory.'}
                </p>

                {(item.address || item.city) && (
                  <address className="not-italic text-xs text-[#64748b] leading-normal block pt-1">
                    {[item.address, item.city, item.state, item.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </address>
                )}

                {item.iska_authority && (
                  <p className="text-xs text-[#102a43] p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <b className="font-semibold text-[#102a43]">Heter Iska authority:</b> {item.iska_authority}
                  </p>
                )}
                {item.iska_details && <p className="text-xs text-[#475569] leading-relaxed">{item.iska_details}</p>}
                {item.public_notes && (
                  <p className="p-3 bg-[#fff7e5] border-l-4 border-[#c69b46] rounded-r-xl text-xs text-[#876622]">{item.public_notes}</p>
                )}
                {item.last_verified && (
                  <time className="block text-[11px] text-[#94a3b8]" dateTime={item.last_verified}>
                    Last verified:{' '}
                    {new Date(
                      `${item.last_verified}T00:00:00`,
                    ).toLocaleDateString('en-US')}
                  </time>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#f1f5f9] text-xs font-bold text-[#c69b46] flex-wrap">
                {item.phone && <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>}
                {item.email && <a href={`mailto:${item.email}`} className="hover:underline">Email</a>}
                {item.website && (
                  <a
                    href={
                      item.website.startsWith('http')
                        ? item.website
                        : `https://${item.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline ml-auto"
                  >
                    Website →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    {/* CTA Section Banner */}
      <BottomCTA eyebrow={"IMPORTANT GUIDANCE"} title={"Verify before relying on a listing"} discription={"A listing is educational information and does not guarantee that every transaction is covered. Confirm that the business’s Heter Iska is current, properly executed, and applicable to the specific arrangement."} link="/bais-horaah" linktext="Ask the Bais Horaah →" link2="" link2text=""/>
    <SiteFooter/>
     </>
  );
}
