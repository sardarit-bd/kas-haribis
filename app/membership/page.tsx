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
    <main className="min-h-screen bg-[#fbfaf7] text-slate-900 flex flex-col font-sans">
      <SiteHeader />

      {/* Section 1: Hero (Dark Navy Theme) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-8 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">
              KAV HARIBIS MEMBERSHIP
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Stay connected.
              <br />
              <span className="text-[#c69b46]">Keep learning.</span>
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-2xl">
              A free Kav Haribis membership for publications, alerts, account
              preferences, and future book orders—all organized in one secure place.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                className="px-6 py-3.5 bg-[#c69b46]  text-[#102a43] text-md font-medium text-center"
                href="/membership/account"
              >
                Join Kav Haribis
              </a>
              <a
                className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-md font-medium text-center"
                href="/membership/account"
              >
                Member login
              </a>
            </div>
            <p className="text-slate-400 text-xs tracking-wide hidden">
              This membership belongs exclusively to the Kav Haribis organization.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Benefits Grid (Warm Cream Theme) */}
      <section className="bg-[#f7f3ea] py-16 md:py-16">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="space-y-2">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">
              MEMBERSHIP BENEFITS
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
              Everything in one place
            </h2>
            <p className="text-slate-600 text-sm sm:text-base pt-2 max-w-2xl leading-relaxed">
              You control what you receive. Newsletter, Ribbis Alert, and discount
              notifications can be selected according to your preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item) => (
              <article
                className="bg-white border border-gray-100 p-6 sm:p-8 space-y-3 hover:border-[#c69b46] hover:shadow-md transition duration-300 flex flex-col"
                key={item.mark}
              >
                <span className="text-[#c69b46] font-mono text-md font-bold">
                  {item.mark}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#102a43]">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <BottomCTA
        eyebrow={"FREE TO JOIN"}
        title={"Become a Kav Haribis member"}
        discription={
          "Register, choose your preferences, and begin building your Kav Haribis member history."
        }
        link="/membership/account"
        linktext="Create or open your account →"
        link2=""
        link2text=""
      />

      <SiteFooter />
    </main>
  );
}
