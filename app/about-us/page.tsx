import BottomCTA from '../componnent/BottomCTA';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const metadata = {
  title: 'About Us | Kav Haribis',
  description: 'Learn about Kav Haribis, our founders, rabbinic leadership, mission, and community programs for Hilchos Ribbis.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-clip">
      <SiteHeader />

      {/* Hero Banner Section */}
      <section className="min-h-[540px] bg-[#102a43] text-white relative overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[50px] items-center">
          <div className="flex flex-col">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold leading-tight tracking-tight mt-3.5 mb-5">
              Clarity in Hilchos Ribbis.
              <em className="text-[#e5c474] not-italic block mt-2 font-semibold">Guidance for everyday life.</em>
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal max-w-[620px] mb-8">
              Kav Haribis is a dedicated halachic center bringing clarity to the laws of ribbis through comprehensive education, communal outreach, research directories, and direct access to experienced Rabbanim.
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <a
                href="/bais-horaah"
                style={{ color: 'black' }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Ask the Bais Horaah</span>
              </a>
              <a
                href="/programs"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-all duration-300"
              >
                <span>Explore Programs</span>
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden border border-[#c69b46]/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-[360px] sm:h-[420px]">
            <img
              src="/kav-impact/heter-iska-presentation.jpg"
              alt="Kav Haribis presenting a Heter Iska"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Welcome & Founder Story Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[100px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          <div className="overflow-hidden border border-slate-200 shadow-md h-[320px] sm:h-[380px]">
            <img
              src="/kav-impact/heter-iska-presentation-2.jpg"
              alt="Kav Haribis educational presentation"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43] leading-tight tracking-tight mb-6">
              A center for awareness, education, and practical halachic guidance
            </h2>
            <div className="space-y-4">
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                Kav Haribis was founded by <strong className="text-[#102a43] font-semibold">Rabbi Yaakov Yitzchok Jacob</strong> together with other talmidim of <strong className="text-[#102a43] font-semibold">Harav Pinchos Vind shlita</strong>. Inspired by Rav Vind’s worldwide network of Batei Horaah and his lifelong commitment to expanding awareness of Hilchos Ribbis, they established Kav Haribis to make these complex halachos clearer and more accessible for modern business and everyday financial life.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                Kav Haribis works closely with Harav Pinchos Vind shlita and his network of Batei Horaah to advance public awareness and provide current, carefully considered guidance in Hilchos Ribbis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rabbinic Leadership & Advisory Banner */}
      <section className="bg-[#102a43] text-white">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[90px] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-[60px] items-center">
          <div className="overflow-hidden border border-white/10 shadow-lg h-[320px] sm:h-[400px]">
            <img
              src="/kav-impact/recognition-event.jpg"
              alt="Kav Haribis community recognition event"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-white mb-5">
              Rooted in Torah. Responsive to modern financial life.
            </h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-4">
              Harav Pinchos Vind shlita had the privilege of discussing many questions in Hilchos Ribbis with <strong className="text-[#e5c474] font-semibold">Harav Yosef Shalom Elyashiv zt״l</strong> and <strong className="text-[#e5c474] font-semibold">Harav Shmuel Wosner zt״l</strong>, among other Gedolei Yisroel.
            </p>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-4">
              Through his close relationships with leading contemporary Gedolim, complex financial questions can be clarified with the depth, care, and practical understanding they require. The Rabbanim of the Kav Haribis Bais Horaah bring this guidance to the real financial questions facing individuals, families, businesses, and institutions.
            </p>
            <a
              href="/bais-horaah"
              className="inline-flex items-center gap-2 text-[#e5c474] hover:text-white font-semibold text-sm sm:text-base transition-colors mt-2"
            >
              <span>Learn about the Bais Horaah</span>
              <span className="text-lg">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Our Mission & Core Pillars Section */}
      <section className="bg-gray-200 py-16 md:py-[100px]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43] tracking-tight">
              Helping Klal Yisroel navigate financial life responsibly
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                01
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Awareness &amp; Education
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Shiurim, articles, alerts, and community programs that bring Hilchos Ribbis into everyday conversation and financial decision-making.
              </p>
            </article>

            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                02
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Practical Guidance
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Clear educational resources and direct access to experienced Rabbanim for personal, commercial, and institutional questions.
              </p>
            </article>

            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                03
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Research &amp; Resources
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Careful financial research, kosher bank directories, custom Heter Iska documents, and tools designed for practical everyday use.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Work in Action Photo Showcase */}
      <section className="bg-white py-16 md:py-[95px]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-[60px] items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#102a43] mb-4 tracking-tight leading-tight">
              Education that reaches every part of the community
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal mb-6">
              From classrooms and community events to businesses and financial institutions, Kav Haribis works to make awareness of Hilchos Ribbis practical, visible, and lasting.
            </p>
            <a
              href="/programs"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#102a43] hover:bg-[#173f5f] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="text-white">See All Programs</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 overflow-hidden h-[260px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/community-event.jpg"
                alt="Kav Haribis community gathering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden h-[220px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/student-shiur.jpg"
                alt="Students attending a Kav Haribis shiur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden h-[220px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/financial-outreach.jpg"
                alt="Kav Haribis financial outreach visit"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <BottomCTA
        eyebrow={"HOW CAN WE HELP?"}
        title={"Bring your question, program, or research need to Kav Haribis."}
        discription={"Whether you have a personal question, need halachic guidance for a financial product, or would like to invite Kav Haribis to present a program, we are here to help."}
        link="/contact"
        linktext="Contact Kav Haribis"
        link2="/contact"
        link2text="Contact Kav Haribis"
      />

      <SiteFooter />
    </main>
  );
}
