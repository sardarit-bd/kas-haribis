import BottomCTA from "../componnent/BottomCTA";
import { listSavingsAccounts } from '../lib/directories';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
const safeLink = (value: string) =>
  /^https?:\/\//i.test(value || '') ? value : '';
export default async function SavingsPage() {
  const { env } = await import('cloudflare:workers'),
    items = (await listSavingsAccounts(env.DB)) as any[];
  return (
    <>
    <SiteHeader/>
    <InteriorPage
      eyebrow="SAVINGS RESEARCH"
      title="Kosher High-Yield Savings Accounts"
      intro="Compare savings opportunities together with the practical information Kav Haribis has reviewed. Rates and terms can change, so verify the current details before opening an account."
    />
      


      <section className=" py-8 bg-[#f7f3ea]">
        <div className="container flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">AVAILABLE ACCOUNTS</p>
            <h2 className="text-[#102a43] font-serif font-bold text-3xl sm:text-4xl">Compare high-yield savings options</h2>
            <p className="max-w-md text-xs sm:text-sm text-[#64748b] leading-relaxed pt-5">
            Kav Haribis provides educational research. A listing is not
            financial advice or a guarantee of current rates.
          </p>
          </div>
          
        </div>
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((x) => {
            const link = safeLink(x.open_account_url);
            return (
              <article
                className={`p-6 bg-white flex flex-col justify-between space-y-4 ${
                  x.featured ? 'border-t-4 border-t-[#c69b46]' : ''
                }`}
                key={x.id}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[88px_1fr_auto] gap-4 items-center pb-4">
                    {x.logo_url ? (
                      <img
                        src={x.logo_url}
                        alt={`${x.institution_name} logo`}
                        className="w-[88px] h-[72px] object-contain p-2 bg-[#f4f5f3] border border-[#e2e8f0]"
                      />
                    ) : (
                      <span className="w-[88px] h-[72px] bg-[#102a43] text-[#e4c473] font-serif text-3xl font-bold flex items-center justify-center">
                        {String(x.institution_name || 'S')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                    <div>
                      <small className="block text-[13px] font-meduim text-[#3f7a50] uppercase tracking-wider">
                        {x.kosher_status || 'Review available'}
                      </small>
                      <h3 className="text-3xl font-serif font-meduim text-[#102a43] leading-snug">{x.institution_name}</h3>
                      <b className="text-base text-[#9a742d] font-meduim block mt-0.5">{x.account_name || 'High-Yield Savings Account'}</b>
                    </div>
                    {x.apy && (
                      <em className="not-italic min-w-[82px] text-center p-3 bg-[#f5f1e7] rounded-xl border border-[#e2dacd] block shrink-0 sm:self-start">
                        <strong className="block font-serif text-2xl font-bold text-[#102a43]">{x.apy}</strong>
                        <small className="block text-[10px] font-bold text-[#9a742d] tracking-wider uppercase">APY</small>
                      </em>
                    )}
                  </div>

                  <p className="text-base text-[#475569] leading-relaxed">
                    {x.description ||
                      'Savings-account information reviewed by Kav Haribis.'}
                  </p>

                  <dl className="grid grid-cols-[140px_1fr] gap-2 text-xs py-2">
                    {x.minimum_deposit && (
                      <>
                        <dt className="font-bold text-[#9b762e] uppercase tracking-wider text-[10px]">Minimum deposit</dt>
                        <dd className="m-0 text-[#405469] font-medium">{x.minimum_deposit}</dd>
                      </>
                    )}
                    {x.monthly_fee && (
                      <>
                        <dt className="font-bold text-[#9b762e] uppercase tracking-wider text-[10px]">Monthly fee</dt>
                        <dd className="m-0 text-[#405469] font-medium">{x.monthly_fee}</dd>
                      </>
                    )}
                    {x.fdic_status && (
                      <>
                        <dt className="font-bold text-[#9b762e] uppercase tracking-wider text-[10px]">Deposit insurance</dt>
                        <dd className="m-0 text-[#405469] font-medium">{x.fdic_status}</dd>
                      </>
                    )}
                    {x.last_reviewed && (
                      <>
                        <dt className="font-bold text-[#9b762e] uppercase tracking-wider text-[10px]">Last reviewed</dt>
                        <dd className="m-0 text-[#405469] font-medium">
                          {new Date(
                            `${x.last_reviewed}T00:00:00`,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </dd>
                      </>
                    )}
                  </dl>

                  {x.kosher_details && (
                    <div className="p-4 bg-[#f1f5f2] border-l-4 border-[#4f8a60] space-y-1">
                      <small className="block text-[13px] font-meduim text-[#39734a] uppercase tracking-wider">KOSHER ACCOUNT INFORMATION</small>
                      <p className="text-md text-[#425d4a]/70 leading-relaxed m-0">{x.kosher_details}</p>
                    </div>
                  )}

                  {x.public_notes && (
                    <p className="p-3 bg-[#fff7e6] border-l-4 border-[#c69b46] rounded-r-xl text-xs text-[#876622]">{x.public_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#e5e8e9] text-xs font-meduim text-[#c69b46] flex-wrap">
                  {link ? (
                    <a
                      className="px-4 py-2 bg-[#102a43] hover:bg-[#1a385c] text-white rounded-lg transition-colors text-xs font-bold shadow-sm"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open an Account ↗
                    </a>
                  ) : (
                    <span className="text-[#7b8790]/80 text-base">Account-opening link coming soon</span>
                  )}
                  {safeLink(x.website) && x.website !== link && (
                    <a
                      href={x.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline ml-auto"
                    >
                      Institution website
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
  
      <BottomCTA eyebrow={"IMPORTANT"} title={"Confirm terms before depositing funds"} discription={"Interest rates, fees, eligibility, and account structures can change. Review the institution’s current disclosures and ask a qualified Rav when a personal halachic question applies."}
       link="/bais-horaah" linktext="Ask a Ribbis question →" link2="" link2text=""/>
      <SiteFooter/> 
    </>
  );
}
