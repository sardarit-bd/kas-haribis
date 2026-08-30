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
    <main className="impactProgramsPage">
      <SiteHeader />
      <section className="impactHero">
        <div>
          <p className="eyebrow">EDUCATION &amp; OUTREACH</p>
          <h1>Bringing Hilchos Ribbis into everyday life.</h1>
          <p>
            Kav Haribis works with schools, communities, businesses, financial
            professionals, and Rabbanim to turn awareness into practical,
            responsible action.
          </p>
          <div>
            <a className="primary" href="/contact?topic=Program%20request">
              Request a program →
            </a>
            <a href="#program-gallery">See our work ↓</a>
          </div>
        </div>
        <img
          src="/kav-impact/community-event.jpg"
          alt="Kav Haribis community education event"
        />
      </section>
      <section className="impactProgramTypes">
        <div>
          <p className="eyebrow gold">PROGRAMS FOR EVERY AUDIENCE</p>
          <h2>Education shaped around real needs</h2>
        </div>
        <div className="impactTypeGrid">
          <article>
            <span>01</span>
            <h3>Schools &amp; yeshivos</h3>
            <p>
              Age-appropriate learning that builds awareness early and makes
              practical halachos understandable.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Businesses &amp; professionals</h3>
            <p>
              Focused presentations on contracts, financing, partnerships,
              payment practices, and Heter Iska.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Communities &amp; Rabbanim</h3>
            <p>
              Shiurim, advanced training, and public-awareness programs for
              kehillos and community leadership.
            </p>
          </article>
        </div>
      </section>
      <section className="impactGallery" id="program-gallery">
        <div className="impactGalleryHead">
          <div>
            <p className="eyebrow gold">KAV HARIBIS IN ACTION</p>
            <h2>Education, outreach, and implementation</h2>
          </div>
          <p>
            A look at the people, institutions, and communities reached through
            Kav Haribis programs.
          </p>
        </div>
        <div className="impactPhotoGrid">
          {gallery.map((item) => (
            <figure className={item.className || ''} key={item.src}>
              <img src={item.src} alt={item.title} loading="lazy" />
              <figcaption>
                <small>KAV HARIBIS</small>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="impactCallout">
        <div>
          <p className="eyebrow">BRING A PROGRAM TO YOUR COMMUNITY</p>
          <h2>Let’s build the right presentation for your audience.</h2>
          <p>
            Tell us about your school, business, organization, or community and
            what you would like the program to address.
          </p>
        </div>
        <a className="primary" href="/contact?topic=Program%20request">
          Request a Kav Haribis program →
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
