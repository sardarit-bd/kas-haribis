import { SiteFooter, SiteHeader } from '../shared/site-shell';

export default function AboutPage() {
  return (
    <main className="aboutPage">
      <SiteHeader />
      <section className="aboutHero">
        <div className="aboutHeroCopy">
          <p className="eyebrow">ABOUT KAV HARIBIS</p>
          <h1>
            Clarity in Hilchos Ribbis.
            <br />
            <em>Guidance for everyday life.</em>
          </h1>
          <p>
            Kav Haribis is a halachic center dedicated to bringing clarity to
            the laws of ribbis through education, outreach, practical resources,
            and access to knowledgeable Rabbanim.
          </p>
          <div className="aboutHeroActions">
            <a className="primary" href="/bais-horaah">
              Ask the Bais Horaah
            </a>
            <a href="/programs">Explore our programs →</a>
          </div>
        </div>
        <div className="aboutHeroPhoto">
          <img
            src="/kav-impact/heter-iska-presentation.jpg"
            alt="Kav Haribis presenting a Heter Iska"
          />
          <span>
            <b>Awareness.</b> Guidance. Responsibility.
          </span>
        </div>
      </section>

      <section className="aboutWelcome">
        <div>
          <p className="eyebrow gold">WELCOME TO KAV HARIBIS</p>
          <h2>
            A center for awareness, education, and practical halachic guidance
          </h2>
        </div>
        <div className="aboutWelcomeText">
          <p>
            Kav Haribis was founded by{' '}
            <strong>Rabbi Yaakov Yitzchok Jacob</strong> together with other
            talmidim of <strong>Harav Pinchos Vind shlita</strong>. Inspired by
            Rav Vind’s worldwide network of Batei Horaah and his commitment to
            expanding awareness of Hilchos Ribbis, they established Kav Haribis
            to help make these complex halachos clearer and more accessible.
          </p>
          <p>
            Kav Haribis works closely with Harav Pinchos Vind shlita and his
            network of Batei Horaah to advance public awareness and provide
            current, carefully considered guidance in Hilchos Ribbis.
          </p>
        </div>
      </section>

      <section className="aboutGuidance">
        <div className="aboutGuidancePhoto">
          <img
            src="/kav-impact/recognition-event.jpg"
            alt="Kav Haribis community recognition event"
          />
        </div>
        <div className="aboutGuidanceCopy">
          <p className="eyebrow">RABBINIC GUIDANCE</p>
          <h2>Rooted in Torah. Responsive to modern financial life.</h2>
          <p>
            Harav Pinchos Vind shlita had the privilege of discussing many
            questions in Hilchos Ribbis with{' '}
            <strong>Harav Yosef Shalom Elyashiv zt״l</strong> and{' '}
            <strong>Harav Shmuel Wosner zt״l</strong>, among other Gedolei
            Yisroel.
          </p>
          <p>
            Through his close relationships with leading contemporary Gedolim,
            complex questions can be clarified with the depth, care, and
            practical understanding they require. The Rabbanim of the Kav
            Haribis Bais Horaah bring this guidance to the real financial
            questions facing individuals, families, businesses, and
            institutions.
          </p>
          <a href="/bais-horaah">Learn about the Bais Horaah →</a>
        </div>
      </section>

      <section className="aboutMission">
        <div className="aboutSectionHead">
          <p className="eyebrow gold text-center">OUR MISSION</p>
          <div className='w-full'>
            <h2 className='text-center w-full'>Helping Klal Yisroel navigate financial life responsibly</h2>
          </div>
        </div>
        <div className="aboutPillars">
          <article>
            <span>01</span>
            <h3>Awareness & Education</h3>
            <p>
              Shiurim, articles, alerts, and community programs that bring
              Hilchos Ribbis into everyday conversation.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Practical Guidance</h3>
            <p>
              Clear resources and access to Rabbanim for personal, business, and
              institutional questions.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Research & Resources</h3>
            <p>
              Careful financial research, directories, Heter Iska documents, and
              tools designed for practical use.
            </p>
          </article>
        </div>
      </section>

      <section className="aboutImpact">
        <div className="aboutImpactCopy">
          <p className="eyebrow">OUR WORK IN ACTION</p>
          <h2>Education that reaches every part of the community</h2>
          <p>
            From classrooms and community events to businesses and financial
            institutions, Kav Haribis works to make awareness of Hilchos Ribbis
            practical, visible, and lasting.
          </p>
          <a className="primary" href="/programs">
            See all programs
          </a>
        </div>
        <div className="aboutGallery">
          <figure className="wide">
            <img
              src="/kav-impact/community-event.jpg"
              alt="Kav Haribis community gathering"
            />
          </figure>
          <figure>
            <img
              src="/kav-impact/student-shiur.jpg"
              alt="Students attending a Kav Haribis shiur"
            />
          </figure>
          <figure>
            <img
              src="/kav-impact/financial-outreach.jpg"
              alt="Kav Haribis financial outreach visit"
            />
          </figure>
        </div>
      </section>
      

      <section className='my-10'>
        <section className="aboutCta">
        <div>
          <p className="eyebrow">HOW CAN WE HELP?</p>
          <h2>
            Bring your question, program, or research need to Kav Haribis.
          </h2>
        </div>
        <div>
          <a className="primary" href="/contact">
            Contact Kav Haribis
          </a>
          <a className='hidden' href="/bais-horaah">Submit a Ribbis question →</a>
        </div>
      </section>
      </section>
      <SiteFooter />
    </main>
  );
}
