import { SiteFooter, SiteHeader } from '../shared/site-shell';

const gallery = [
  {
    src: '/kav-impact/student-shiur.jpg',
    title: 'Student education',
    text: 'Practical presentations introducing the next generation to everyday Hilchos Ribbis.',
    className: 'wide',
  },
  {
    src: '/kav-impact/heter-iska-presentation.jpg',
    title: 'Heter Iska outreach',
    text: 'Bringing properly prepared Heter Iska resources directly to businesses.',
  },
  {
    src: '/kav-impact/financial-outreach.jpg',
    title: 'Financial-industry outreach',
    text: 'Meeting professionals and institutions where modern financial questions arise.',
  },
  {
    src: '/kav-impact/community-event.jpg',
    title: 'Community gatherings',
    text: 'Supporting broad awareness through public events and organized learning.',
    className: 'wide',
  },
  {
    src: '/kav-impact/business-visit.jpg',
    title: 'Business visits',
    text: 'Personal outreach that helps businesses recognize and address practical concerns.',
  },
  {
    src: '/kav-impact/recognition-event.jpg',
    title: 'Torah leadership',
    text: 'Sharing Kav Haribis educational materials with Rabbanim and community leaders.',
  },
  {
    src: '/kav-impact/heter-iska-presentation-2.jpg',
    title: 'Practical implementation',
    text: 'Helping translate awareness into responsible business practice.',
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white border-b-2 border-[#c69b46]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">EDUCATION &amp; OUTREACH</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Bringing Hilchos Ribbis into everyday life.
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              Kav Haribis works with schools, communities, businesses, financial
              professionals, and Rabbanim to turn awareness into practical,
              responsible action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md text-center" href="/contact?topic=Program%20request">
                Request a program →
              </a>
              <a className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center" href="#program-gallery">
                See our work ↓
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#c69b46]/40">
            <img
              src="/kav-impact/community-event.jpg"
              alt="Kav Haribis community education event"
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Program Types */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8">
        <div className="border-b border-[#e2e8f0] pb-6">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">PROGRAMS FOR EVERY AUDIENCE</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Education shaped around real needs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">01</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Schools &amp; yeshivos</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Age-appropriate learning that builds awareness early and makes
              practical halachos understandable.
            </p>
          </article>
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">02</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Businesses &amp; professionals</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Focused presentations on contracts, financing, partnerships,
              payment practices, and Heter Iska.
            </p>
          </article>
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">03</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Communities &amp; Rabbanim</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Shiurim, advanced training, and public-awareness programs for
              kehillos and community leadership.
            </p>
          </article>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8" id="program-gallery">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0]">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">KAV HARIBIS IN ACTION</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Education, outreach, and implementation</h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#64748b] leading-relaxed">
            A look at the people, institutions, and communities reached through
            Kav Haribis programs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <figure
              className={`group relative rounded-2xl overflow-hidden shadow-md bg-[#071728] border border-[#e2e8f0] ${
                item.className === 'wide' ? 'sm:col-span-2' : ''
              }`}
              key={item.src}
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071728] via-[#071728]/40 to-transparent p-6 flex flex-col justify-end text-white">
                <small className="text-[10px] font-mono font-bold text-[#c69b46] uppercase tracking-widest block mb-1">KAV HARIBIS</small>
                <h3 className="text-lg font-serif font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-2">{item.text}</p>
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* Callout Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12">
        <div className="p-8 sm:p-12 bg-gradient-to-br from-[#071728] to-[#102a43] rounded-2xl border-2 border-[#c69b46]/50 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">BRING A PROGRAM TO YOUR COMMUNITY</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Let’s build the right presentation for your audience.</h2>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              Tell us about your school, business, organization, or community and
              what you would like the program to address.
            </p>
          </div>
          <a className="px-6 py-4 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shrink-0 text-center" href="/contact?topic=Program%20request">
            Request a Kav Haribis program →
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
