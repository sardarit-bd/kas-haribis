import { SiteFooter, SiteHeader } from '../shared/site-shell';
import { listEducationalResources } from '../lib/directories';

export const dynamic = 'force-dynamic';

export default async function EducationalCenter() {
  const { env } = await import('cloudflare:workers');
  const items = (await listEducationalResources(env.DB)) as any[];
  return (
    <main className="educationPage">
      <SiteHeader />
      <section className="educationHero">
        <div>
          <p className="eyebrow">LEARN • CREATE • GROW</p>
          <h1>Educational Center</h1>
          <p>
            Thoughtful, classroom-ready tools that make Hilchos Ribbis clear,
            memorable, and age-appropriate.
          </p>
          <div>
            <a href="#resources" className="primary">
              Explore free resources
            </a>
            <a href="/contact" className="educationGhost">
              Bring it to your school
            </a>
          </div>
        </div>
        <aside>
          <span>✦</span>
          <b>
            Torah learning
            <br />
            made engaging.
          </b>
          <small>Print. Color. Discuss. Remember.</small>
        </aside>
      </section>
      <section className="educationPromise">
        <div>
          <small>FOR THE CLASSROOM</small>
          <h2>Big ideas, made approachable.</h2>
        </div>
        <p>
          Use these materials to open meaningful conversations about lending,
          fairness, and the mitzvos that guide everyday financial life.
        </p>
        <div>
          <span>01</span>
          <b>Print-ready</b>
        </div>
        <div>
          <span>02</span>
          <b>Student-friendly</b>
        </div>
        <div>
          <span>03</span>
          <b>Torah-centered</b>
        </div>
      </section>
      <section id="resources" className="educationLibrary">
        <header>
          <div>
            <p className="eyebrow gold">FREE DOWNLOADS</p>
            <h2>Learning resources</h2>
          </div>
          <p>
            Coloring sheets, printable activities, and PDF pamphlets—ready for
            homes, classrooms, and community programs.
          </p>
        </header>
        <div className="educationGrid">
          {items.map((item) => {
            const src = item.file_key?.startsWith('static:')
              ? item.file_key.slice(7)
              : `/api/educational-file?id=${encodeURIComponent(item.id)}`;
            const cover =
              item.id === 'neighbors-guide-ribbis'
                ? '/education/neighbors-guide-to-ribbis-cover.jpg'
                : item.id === 'ribbis-stench-tumah'
                  ? '/education/ribbis-gave-off-a-stench-of-tumah-cover.jpg'
                  : item.id === 'chaims-big-dream'
                    ? '/education/chaims-big-dream-cover.jpg'
                    : '';
            return (
              <article key={item.id}>
                <figure>
                  {item.file_type?.startsWith('image/') ? (
                    <img src={src} alt={item.title} />
                  ) : cover ? (
                    <img src={cover} alt={`${item.title} cover`} />
                  ) : (
                    <div className="educationPdf">
                      PDF<span>Classroom resource</span>
                    </div>
                  )}
                  <span>{item.resource_type}</span>
                </figure>
                <div>
                  <small>{item.audience || 'All learners'}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="educationActions">
                    <a
                      className="educationView"
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View material <b>↗</b>
                    </a>
                    <a
                      className="educationDownload"
                      href={`${src}${src.includes('?') ? '&' : '?'}download=1`}
                      download={item.file_name}
                    >
                      Download &amp; print <b>↓</b>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!items.length && (
          <p className="educationEmpty">
            New educational resources are coming soon.
          </p>
        )}
      </section>
      <section className="educationCta">
        <small>SCHOOLS &amp; EDUCATORS</small>
        <h2>Want a Ribbis curriculum for your school?</h2>
        <p>
          Reach out and see what we can do for you. We can explore
          age-appropriate lessons, workshops, and educational materials designed
          for your students.
        </p>
        <a href="/contact" className="primary">
          Start a conversation →
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
