import { listRibbisAlerts } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
import AlertLibrary from './alert-library';
import SubscriptionForm from './subscription-form';
import TipForm from './tip-form';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listRibbisAlerts(env.DB)) as any[];
  const hasFeatured = items.some(
    (x) => x.featured && x.alert_status !== 'Archived',
  );
  return (
    <InteriorPage
      eyebrow="RIBBIS ALERTS"
      title="Know before you sign, lend, borrow, or invest"
      intro="Timely warnings, updated guidance, and directory changes from Kav Haribis—organized so you can quickly understand what deserves attention."
    >
      <section className="my-8 p-6 sm:p-10 bg-[#f7f3ea] rounded-2xl border border-[#e2dacd] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">COMMUNITY AWARENESS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">A professional alert center for practical financial concerns</h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Search current guidance, open the full details, share important
            notices, and submit information that may help protect the community.
          </p>
        </div>
        <aside className="lg:col-span-4 p-6 bg-white border border-[#ded7c9] rounded-xl shadow-sm flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-[#102a43] text-[#c69b46] font-bold text-2xl flex items-center justify-center shrink-0">!</span>
          <div>
            <strong className="block font-serif text-3xl font-bold text-[#102a43]">
              {items.filter((x) => x.alert_status !== 'Archived').length}
            </strong>
            <b className="text-xs font-extrabold text-[#c69b46] uppercase tracking-wider block">active notices</b>
            <small className="text-[11px] text-[#64748b]">Reviewed and maintained by Kav Haribis.</small>
          </div>
        </aside>
      </section>

      <div className={hasFeatured ? 'my-8' : 'my-8'}>
        <AlertLibrary items={items} />
      </div>

      <SubscriptionForm />

      <details className="my-10 border border-[#e2dacd] rounded-2xl bg-[#f7f3ea] overflow-hidden group">
        <summary className="p-6 cursor-pointer flex items-center justify-between gap-4 font-serif font-bold text-lg text-[#102a43] hover:bg-[#efe7d8] transition-colors">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#102a43] text-[#c69b46] text-xs font-mono font-bold rounded-lg uppercase tracking-wider">Have a tip?</span>
            <span>Share information securely</span>
          </div>
          <i className="not-italic text-2xl text-[#c69b46] group-open:rotate-45 transition-transform">＋</i>
        </summary>
        <section className="p-6 sm:p-10 border-t border-[#e2dacd] bg-white space-y-6">
          <div className="space-y-1">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">SHARE A RIBBIS TIP</p>
            <h2 className="text-2xl font-serif font-bold text-[#102a43]">Tell Kav Haribis what may need review</h2>
            <p className="text-xs text-[#64748b]">
              This form is specifically for possible Ribbis alerts, directory
              corrections, and financial practices that may affect the
              community.
            </p>
          </div>
          <TipForm />
        </section>
      </details>

      <section className="my-10 p-6 sm:p-10 bg-[#102a43] text-white rounded-2xl border-2 border-[#c69b46]/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">IMPORTANT</p>
          <h2 className="text-2xl font-serif font-bold text-white">Alerts do not replace a personal psak</h2>
          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            These notices provide general educational guidance. Speak with a
            qualified Rav before acting when your transaction or circumstances
            may raise a halachic question.
          </p>
        </div>
        <a className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md shrink-0 text-center" href="/bais-horaah">Ask the Bais Horaah →</a>
      </section>
    </InteriorPage>
  );
}
