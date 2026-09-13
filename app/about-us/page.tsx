import BottomCTA from '../componnent/BottomCTA';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const metadata = {
  title: 'About Us | Kav Haribis',
  description: 'Learn about Kav Haribis, our founders, rabbinic leadership, mission, and community programs for Hilchos Ribbis.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] overflow-x-clip">
      <SiteHeader />

      {/* Hero Banner Section */}
      <section className="min-h-[540px] bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white relative overflow-hidden border-b-2 border-[#c69b46]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[50px] items-center">
          <div className="flex flex-col">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1 hidden">
              ABOUT KAV HARIBIS
            </p>
            <h1 className="text-white font-serif font-meduim text-3xl sm:text-4xl md:text-5xl lg:text-[58px] leading-[1.12] mt-3.5 mb-5">
              Clarity in Hilchos Ribbis.
              <em className="text-[#e5c474] not-italic block mt-1">Guidance for everyday life.</em>
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-[17px] leading-[1.8] max-w-[620px] mb-8">
              Kav Haribis is a dedicated halachic center bringing clarity to the laws of ribbis through comprehensive education, communal outreach, research directories, and direct access to experienced Rabbanim.
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <a
                href="/bais-horaah"
                className="bg-[#c69b46] hover:bg-[#b08738] text-white font-extrabold py-3.5 px-7 text-sm transition-colors shadow-md inline-flex items-center gap-2"
              >
                <span>Ask the Bais Horaah</span>
                <span>→</span>
              </a>
              <a
                href="/programs"
                className="border border-[#c69b46]/50 hover:border-[#c69b46] text-[#e5c474] font-extrabold py-3.5 px-6 text-sm transition-colors inline-flex items-center gap-2 bg-white/5 hover:bg-white/10"
              >
                <span>Explore Programs</span>
                <span>→</span>
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
      <section className="bg-white border-b border-[#eee8dc]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[100px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          <div className=" overflow-hidden border border-[#e2ded5] shadow-[0_12px_36px_rgba(16,42,67,0.08)] h-[320px] sm:h-[380px]">
            <img
              src="/kav-impact/heter-iska-presentation-2.jpg"
              alt="Kav Haribis educational presentation"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-2 hidden">
              WELCOME TO KAV HARIBIS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-meduim text-[#102a43] leading-tight mb-6">
              A center for awareness, education, and practical halachic guidance
            </h2>
            <div className="space-y-4">
              <p className="text-[#475569] text-base sm:text-[16.5px] leading-[1.85]">
                Kav Haribis was founded by <strong className="text-[#102a43]">Rabbi Yaakov Yitzchok Jacob</strong> together with other talmidim of <strong className="text-[#102a43]">Harav Pinchos Vind shlita</strong>. Inspired by Rav Vind’s worldwide network of Batei Horaah and his lifelong commitment to expanding awareness of Hilchos Ribbis, they established Kav Haribis to make these complex halachos clearer and more accessible for modern business and everyday financial life.
              </p>
              <p className="text-[#475569] text-base sm:text-[16.5px] leading-[1.85]">
                Kav Haribis works closely with Harav Pinchos Vind shlita and his network of Batei Horaah to advance public awareness and provide current, carefully considered guidance in Hilchos Ribbis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rabbinic Leadership & Advisory Banner */}
      <section className="bg-gradient-to-br from-[#071728] to-[#102a43] text-white border-t-2 border-[#c69b46] border-b border-[#102a43]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[90px] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-[60px] items-center">
          <div className="rounded-[20px]px] sm:h-[400px]">
            <img
              src="/kav-impact/recognition-event.jpg"
              alt="Kav Haribis community recognition event"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-2 hidden">
              RABBINIC GUIDANCE
            </p>
            <h2 className="font-serif font-meduim text-2xl sm:text-4xl lg:text-[44px] leading-[1.15] text-white mt-2.5 mb-5">
              Rooted in Torah. Responsive to modern financial life.
            </h2>
            <p className="text-[#cbd5e1] text-base leading-[1.8] mb-4">
              Harav Pinchos Vind shlita had the privilege of discussing many questions in Hilchos Ribbis with <strong className="text-[#e5c474]">Harav Yosef Shalom Elyashiv zt״l</strong> and <strong className="text-[#e5c474]">Harav Shmuel Wosner zt״l</strong>, among other Gedolei Yisroel.
            </p>
            <p className="text-[#cbd5e1] text-base leading-[1.8] mb-4">
              Through his close relationships with leading contemporary Gedolim, complex financial questions can be clarified with the depth, care, and practical understanding they require. The Rabbanim of the Kav Haribis Bais Horaah bring this guidance to the real financial questions facing individuals, families, businesses, and institutions.
            </p>
            <a
              href="/bais-horaah"
              className="inline-flex items-center gap-2 text-[#e5c474] font-bold text-sm hover:underline mt-2"
            >
              <span>Learn about the Bais Horaah</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Our Mission & Core Pillars Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[100px]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1.5 hidden">
            OUR MISSION &amp; PILLARS
          </p>
          <h2 className="text-3xl sm:text-4xl font-meduim text-[#102a43]">
            Helping Klal Yisroel navigate financial life responsibly
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[28px] mt-12">
          <article className="bg-white border border-[#dfe5e7] p-7 sm:p-[36px_28px] relative overflow-hidden shadow-[0_4px_18px_rgba(16,42,67,0.04)] hover:border-[#c69b46] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,42,67,0.09)] transition-all duration-300 flex flex-col group">
            <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-serif font-bold text-base grid place-items-center mb-[22px] group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
              01
            </div>
            <h3 className="font-serif font-meduim text-xl sm:text-[25px] text-[#102a43] mb-3">
              Awareness &amp; Education
            </h3>
            <p className="text-[#526879] text-baes leading-[1.7]">
              Shiurim, articles, alerts, and community programs that bring Hilchos Ribbis into everyday conversation and financial decision-making.
            </p>
          </article>

          <article className="bg-white border border-[#dfe5e7]  p-7 sm:p-[36px_28px] relative overflow-hidden shadow-[0_4px_18px_rgba(16,42,67,0.04)] hover:border-[#c69b46] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,42,67,0.09)] transition-all duration-300 flex flex-col group">
            <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-serif font-bold text-base grid place-items-center mb-[22px] group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
              02
            </div>
            <h3 className="font-serif font-meduim text-xl sm:text-[25px] text-[#102a43] mb-3">
              Practical Guidance
            </h3>
            <p className="text-[#526879] text-base leading-[1.7]">
              Clear educational resources and direct access to experienced Rabbanim for personal, commercial, and institutional questions.
            </p>
          </article>

          <article className="bg-white border border-[#dfe5e7] p-7 sm:p-[36px_28px] relative overflow-hidden shadow-[0_4px_18px_rgba(16,42,67,0.04)] hover:border-[#c69b46] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,42,67,0.09)] transition-all duration-300 flex flex-col group">
            <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-serif font-bold text-base grid place-items-center mb-[22px] group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
              03
            </div>
            <h3 className="font-serif font-meduim text-xl sm:text-[25px] text-[#102a43] mb-3">
              Research &amp; Resources
            </h3>
            <p className="text-[#526879] text-base leading-[1.7]">
              Careful financial research, kosher bank directories, custom Heter Iska documents, and tools designed for practical everyday use.
            </p>
          </article>
        </div>
      </section>

      {/* Work in Action Photo Showcase */}
      <section className="bg-[#f7f3ea] py-16 md:py-[95px]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-[60px] items-center">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-2 hidden">
              OUR WORK IN ACTION
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-meduim text-[#102a43] mb-4">
              Education that reaches every part of the community
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              From classrooms and community events to businesses and financial institutions, Kav Haribis works to make awareness of Hilchos Ribbis practical, visible, and lasting.
            </p>
            <a
              href="/programs"
              className="inline-flex items-center gap-2 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold py-3 px-6 text-sm transition shadow-md"
            >
              <span className='text-white'>See All Programs</span>
              <span className='text-white'>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 overflow-hidden h-[260px] shadow-[0_6px_20px_rgba(16,42,67,0.08)] border border-[#e2ded5] group">
              <img
                src="/kav-impact/community-event.jpg"
                alt="Kav Haribis community gathering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className=" overflow-hidden h-[220px] shadow-[0_6px_20px_rgba(16,42,67,0.08)] border border-[#e2ded5] group">
              <img
                src="/kav-impact/student-shiur.jpg"
                alt="Students attending a Kav Haribis shiur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className=" overflow-hidden h-[220px] shadow-[0_6px_20px_rgba(16,42,67,0.08)] border border-[#e2ded5] group">
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
        linktext="Contact Kav Haribis →"
        link2="/contact"
        link2text="Contact Kav Haribis →"
      />

      <SiteFooter showHeterNotice />
    </main>
  );
}
