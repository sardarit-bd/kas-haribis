import BottomCTA from '../componnent/BottomCTA';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

const benefits = [
  {
    mark: '01',
    title: 'Free membership',
    text: 'Create a free Kav Haribis account and keep your information organized in one place.',
  },
  {
    mark: '02',
    title: 'Newsletters & alerts',
    text: 'Choose the Kav Haribis publications and important Ribbis updates you would like to receive.',
  },
  {
    mark: '03',
    title: 'Member-only notices',
    text: 'Optionally receive announcements about Kav Haribis service discounts and special opportunities.',
  },
  {
    mark: '04',
    title: 'Personal dashboard',
    text: 'Manage your member information and communication preferences from your private Kav Haribis account.',
  },
  {
    mark: '05',
    title: 'Book-order history',
    text: 'Future Kav Haribis seforim purchases can appear in your organized order-history section.',
  },
  {
    mark: '06',
    title: 'Built for the future',
    text: 'Your Kav Haribis member record is ready to preserve future orders and support expanding member services.',
  },
];

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col font-sans">
      <SiteHeader />
      <section className="relative max-w-[1440px] mx-auto px-4 sm:px-8 py-12 md:py-20 grid md:grid-cols-12 gap-8 items-center border-b border-slate-200/80 w-full overflow-hidden">
        <div className="md:col-span-8 relative z-10">
          <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-3">KAV HARIBIS MEMBERSHIP</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#102a43] font-bold tracking-tight mb-4 leading-tight">
            Stay connected.
            <br />
            <em className="text-[#a37828] not-italic">Keep learning.</em>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mb-8 leading-relaxed">
            A free Kav Haribis membership for publications, alerts, account
            preferences, and future book orders—all organized in one secure
            place.
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <a className="inline-flex items-center px-6 py-3 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-sm tracking-wide transition shadow-sm" style={{ color: 'white' }} href="/membership/account">
              Join Kav Haribis →
            </a>
            <a className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-sm transition shadow-sm" href="/membership/account">Member login →</a>
          </div>
          <small className="text-slate-500 text-xs tracking-wide">
            This membership belongs exclusively to the Kav Haribis organization.
          </small>
        </div>
        <aside className="md:col-span-4 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl text-center shadow-sm relative z-10">
          <div className="w-20 h-20 rounded-full bg-[#f8fafc] border-2 border-[#a37828] flex flex-col items-center justify-center mx-auto mb-4 text-[#102a43]">
            <span className="font-serif text-xl font-bold">KH</span>
            <i className="not-italic text-[8px] font-bold tracking-widest uppercase text-[#a37828]">MEMBERSHIP</i>
          </div>
          <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase mb-1">MEMBER No.</p>
          <strong className="text-3xl font-mono font-bold text-[#a37828] block mb-6">0001</strong>
          <div className="flex justify-center gap-4 text-[10px] font-bold tracking-wider text-slate-600 uppercase pt-4 border-t border-slate-100">
            <span>READ</span>
            <span className="text-[#a37828]">·</span>
            <span>LEARN</span>
            <span className="text-[#a37828]">·</span>
            <span>CONNECT</span>
          </div>
        </aside>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 md:py-16 w-full border-b border-slate-200/80">
        <div className="mb-4">
          <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">A BETTER WAY TO STAY CONNECTED</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43] mb-4">Your Kav Haribis member home</h2>
        </div>
        <p className="text-slate-600 text-base max-w-3xl leading-relaxed">
          Kav Haribis Membership brings communication preferences, publications,
          and purchasing records together in a private account. New members can
          register at no charge, and existing members can return to manage their
          information.
        </p>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 md:py-16 w-full">
        <div className="mb-10">
          <div>
            <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">MEMBERSHIP BENEFITS</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43] mb-3">Everything in one place</h2>
          </div>
          <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
            You control what you receive. Newsletter, Ribbis Alert, and discount
            notifications can be selected according to your preferences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item) => (
            <article className="bg-white border border-slate-200/90 p-6 rounded-2xl hover:border-[#c69b46] hover:shadow-md transition duration-300 shadow-sm flex flex-col" key={item.mark}>
              <span className="text-[#a37828] font-mono text-lg font-bold mb-3">{item.mark}</span>
              <h3 className="text-xl font-serif font-bold text-[#102a43] mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 md:py-16 w-full grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7">
          <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">ORDER HISTORY</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43] mb-4">Ready for every future sefer order</h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-xl">
            Your Kav Haribis member account includes a dedicated book-order
            history. If no orders are connected yet, the dashboard displays a
            clear empty message and remains ready for future purchases.
          </p>
        </div>
        <aside className="md:col-span-5 bg-white border border-slate-200/90 p-8 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <span className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-6 block">YOUR KAV HARIBIS LIBRARY</span>
          <div className="flex gap-2 items-end h-24 mb-6">
            <div className="w-8 h-20 bg-[#a37828] rounded-t-sm" />
            <div className="w-8 h-24 bg-slate-300 rounded-t-sm" />
            <div className="w-8 h-16 bg-[#102a43] rounded-t-sm" />
          </div>
          <small className="text-slate-500 text-xs">Future orders, neatly organized.</small>
        </aside>
      </section>

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"FREE TO JOIN"} title={"Become a Kav Haribis member"} discription={"Register, choose your preferences, and begin building your Kav Haribis member history."} link="/membership/account" linktext="Create or open your account →" link2="" link2text=""/>

      <SiteFooter />
    </main>
  );
}

