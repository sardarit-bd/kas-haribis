import { listRibbisAlerts } from '../lib/directories';
import { MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
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
    <>
      <SiteHeader/>
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <InteriorPage
          eyebrow="RIBBIS ALERTS"
          title="Know before you sign, lend, borrow, or invest"
          intro="Timely warnings, updated guidance, and directory changes from Kav Haribis—organized so you can quickly understand what deserves attention."
        />
      </MotionDiv>

      <section className='bg-[#f7f3ea] overflow-hidden'>
        <section className="container p-6 sm:p-10 bg-[#f7f3ea] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 space-y-3"
          >
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">COMMUNITY AWARENESS</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">A professional alert center for practical financial concerns</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Search current guidance, open the full details, share important
              notices, and submit information that may help protect the community.
            </p>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="lg:col-span-4 p-6 bg-white flex items-center gap-4 rounded-xl shadow-xs border border-slate-200/80"
          >
            <span className="w-12 h-12 rounded-full bg-[#102a43] text-[#c69b46] font-bold text-2xl flex items-center justify-center shrink-0">!</span>
            <div>
              <strong className="block font-serif text-3xl font-bold text-[#102a43]">
                {items.filter((x) => x.alert_status !== 'Archived').length}
              </strong>
              <b className="text-xl font-semibold text-gray-800 tracking-wider block">Active notices</b>
              <small className="text-md text-gray-600">Reviewed and maintained by Kav Haribis.</small>
            </div>
          </MotionDiv>
        </section>
      </section>
      <section className='bg-gray-200'>
        <div className={`container px-8 py-10 ${hasFeatured ? 'my-8' : 'my-8'}`}>
          <div className='container'>
            <AlertLibrary items={items} />
          </div>
        </div>
      </section>

      <TipForm/>

      <SubscriptionForm />

      <SiteFooter/>
    </>
  );
}

