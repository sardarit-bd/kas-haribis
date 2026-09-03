import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const metadata = {
  title: 'About Us | Kav Haribis',
  description: 'Learn about Kav Haribis, our founders, rabbinic leadership, mission, and community programs for Hilchos Ribbis.',
};

export default function AboutPage() {
  return (
    <main className="aboutPage">
      <SiteHeader />

      {/* Hero Banner Section */}
      <section className="aboutHero">
        <div className="aboutHeroGrid">
          <div className="aboutHeroCopy">
            <p className="eyebrow gold mb-1">ABOUT KAV HARIBIS</p>
            <h1>
              Clarity in Hilchos Ribbis.
              <em>Guidance for everyday life.</em>
            </h1>
            <p className="lead">
              Kav Haribis is a dedicated halachic center bringing clarity to the laws of ribbis through comprehensive education, communal outreach, research directories, and direct access to experienced Rabbanim.
            </p>
            <div className="aboutHeroActions">
              <a
                href="/bais-horaah"
                style={{ color: 'white' }}
                className="bg-[#c69b46] hover:bg-[#b08738] text-white font-bold py-3.5 px-7 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                <span>Ask the Bais Horaah</span>
                <span>→</span>
              </a>
              <a
                href="/programs"
                className="border border-[#c69b46]/50 hover:border-[#c69b46] text-[#e5c474] font-bold py-3.5 px-6 rounded-xl text-sm transition inline-flex items-center gap-2 bg-white/5 hover:bg-white/10"
              >
                <span>Explore Programs</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="aboutHeroCardPhoto">
            <img
              src="/kav-impact/heter-iska-presentation.jpg"
              alt="Kav Haribis presenting a Heter Iska"
            />
            <div className="aboutHeroBadge">
              <b>Awareness.</b> Guidance. Responsibility.
            </div>
          </div>
        </div>
      </section>

      {/* Welcome & Founder Story Section */}
      <section className="aboutWelcomeSection bg-white border-b border-[#eee8dc]">
        <div className="aboutWelcomeGrid">
          <div>
            <p className="eyebrow gold mb-2">WELCOME TO KAV HARIBIS</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102a43] leading-tight">
              A center for awareness, education, and practical halachic guidance
            </h2>
          </div>
          <div className="aboutWelcomeText">
            <p>
              Kav Haribis was founded by <strong>Rabbi Yaakov Yitzchok Jacob</strong> together with other talmidim of <strong>Harav Pinchos Vind shlita</strong>. Inspired by Rav Vind’s worldwide network of Batei Horaah and his lifelong commitment to expanding awareness of Hilchos Ribbis, they established Kav Haribis to make these complex halachos clearer and more accessible for modern business and everyday financial life.
            </p>
            <p>
              Kav Haribis works closely with Harav Pinchos Vind shlita and his network of Batei Horaah to advance public awareness and provide current, carefully considered guidance in Hilchos Ribbis.
            </p>
          </div>
        </div>
      </section>

      {/* Rabbinic Leadership & Advisory Banner */}
      <section className="aboutGuidanceBanner">
        <div className="aboutGuidanceGrid">
          <div className="aboutGuidancePhoto">
            <img
              src="/kav-impact/recognition-event.jpg"
              alt="Kav Haribis community recognition event"
            />
          </div>
          <div className="aboutGuidanceCopy">
            <p className="eyebrow gold mb-2">RABBINIC GUIDANCE</p>
            <h2>Rooted in Torah. Responsive to modern financial life.</h2>
            <p>
              Harav Pinchos Vind shlita had the privilege of discussing many questions in Hilchos Ribbis with <strong>Harav Yosef Shalom Elyashiv zt״l</strong> and <strong>Harav Shmuel Wosner zt״l</strong>, among other Gedolei Yisroel.
            </p>
            <p>
              Through his close relationships with leading contemporary Gedolim, complex financial questions can be clarified with the depth, care, and practical understanding they require. The Rabbanim of the Kav Haribis Bais Horaah bring this guidance to the real financial questions facing individuals, families, businesses, and institutions.
            </p>
            <a
              href="/bais-horaah"
              className="inline-flex items-center gap-2 text-[#e5c474] font-bold text-sm hover:underline mt-4"
            >
              <span>Learn about the Bais Horaah</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Our Mission & Core Pillars Section (Matching Landing Page 3-Col Cards) */}
      <section className="aboutMissionSection">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="eyebrow gold mb-1.5">OUR MISSION &amp; PILLARS</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102a43]">
            Helping Klal Yisroel navigate financial life responsibly
          </h2>
        </div>

        <div className="aboutPillarsGrid">
          <article className="aboutPillarCard">
            <div className="aboutPillarNumber">01</div>
            <h3>Awareness &amp; Education</h3>
            <p>
              Shiurim, articles, alerts, and community programs that bring Hilchos Ribbis into everyday conversation and financial decision-making.
            </p>
          </article>

          <article className="aboutPillarCard">
            <div className="aboutPillarNumber">02</div>
            <h3>Practical Guidance</h3>
            <p>
              Clear educational resources and direct access to experienced Rabbanim for personal, commercial, and institutional questions.
            </p>
          </article>

          <article className="aboutPillarCard">
            <div className="aboutPillarNumber">03</div>
            <h3>Research &amp; Resources</h3>
            <p>
              Careful financial research, kosher bank directories, custom Heter Iska documents, and tools designed for practical everyday use.
            </p>
          </article>
        </div>
      </section>

      {/* Work in Action Photo Showcase */}
      <section className="aboutImpactSection">
        <div className="aboutImpactGrid">
          <div>
            <p className="eyebrow gold mb-2">OUR WORK IN ACTION</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102a43] mb-4">
              Education that reaches every part of the community
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              From classrooms and community events to businesses and financial institutions, Kav Haribis works to make awareness of Hilchos Ribbis practical, visible, and lasting.
            </p>
            <a
              href="/programs"
              style={{ color: 'white' }}
              className="inline-flex items-center gap-2 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-md"
            >
              <span>See All Programs</span>
              <span>→</span>
            </a>
          </div>

          <div className="aboutGalleryGrid">
            <div className="aboutGalleryCard wide">
              <img
                src="/kav-impact/community-event.jpg"
                alt="Kav Haribis community gathering"
              />
            </div>
            <div className="aboutGalleryCard">
              <img
                src="/kav-impact/student-shiur.jpg"
                alt="Students attending a Kav Haribis shiur"
              />
            </div>
            <div className="aboutGalleryCard">
              <img
                src="/kav-impact/financial-outreach.jpg"
                alt="Kav Haribis financial outreach visit"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Banner */}
      <section className="aboutCtaBanner">
        <div className="aboutCtaInner">
          <div>
            <p className="eyebrow gold mb-1">HOW CAN WE HELP?</p>
            <h2>Bring your question, program, or research need to Kav Haribis.</h2>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/contact"
              style={{ color: 'white' }}
              className="bg-[#c69b46] hover:bg-[#b08738] text-white font-bold py-3.5 px-7 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
            >
              <span>Contact Kav Haribis</span>
              <span>→</span>
            </a>
            <a
              href="/bais-horaah"
              className="border border-white/30 hover:border-white text-white font-bold py-3.5 px-6 rounded-xl text-sm transition inline-flex items-center gap-2"
            >
              <span>Submit a Question</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter showHeterNotice />
    </main>
  );
}
