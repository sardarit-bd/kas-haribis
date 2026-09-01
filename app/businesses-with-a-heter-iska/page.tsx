import { listBusinesses } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';

export const dynamic = 'force-dynamic';
export default async function BusinessesPage() {
  const { env } = await import('cloudflare:workers');
  const businesses = (await listBusinesses(env.DB)) as any[];
  return (
    <InteriorPage
      eyebrow="KOSHER COMMERCE DIRECTORY"
      title="Businesses With a Heter Iska"
      intro="A growing directory of businesses listed by Kav Haribis as operating with a Heter Iska. Review the information and confirm that the document remains current before relying on a listing."
    >
      <div className='hidden'>
      <section className="businessIskaIntroduction">
        <div className="businessIntroCopy">
          <p className="eyebrow gold">RESPONSIBLE JEWISH COMMERCE</p>
          <h2>A Heter Iska belongs at the heart of every business</h2>
          <p>
            Financial arrangements can create questions of Ribbis even in
            ordinary business activity. A properly prepared Heter Iska helps
            structure qualifying transactions in accordance with halacha.
          </p>
          <div className="businessIntroActions">
            <a className="primary" href="#business-directory">
              View listed businesses ↓
            </a>
            <a href="/heter-iska">Learn about Heter Iska →</a>
          </div>
        </div>
        <aside className="sternbuchQuote" dir="rtl" lang="he">
          <span>״</span>
          <blockquote>
            אלא הם דברי הגאון הרב משה שטרנבוך שליט״א בהקדמה לספרו קיצור דיני
            רבית המצויים: ״והנה הצורך להיתר עיסקא לחנונים ובעלי עסקים נחוץ ביותר
            וראוי לרבנים לתקן בארץ ובחו״ל שכל סוחר יחתום בשטר עיסקא ויתלה בחנות
            או בית עסק במקום בולט ...״
          </blockquote>
          <cite>הגאון הרב משה שטרנבוך שליט״א</cite>
        </aside>
      </section>
      </div>
      <section className="businessDirectory my-10" id="business-directory">
        <div className="businessDirectoryHeading">
          <div>
            <p className="eyebrow gold">DIRECTORY</p>
            <h2>Listed businesses</h2>
            <p>
              Each listing reflects information collected by Kav Haribis.
              Documents and business practices can change, so current
              verification is always recommended.
            </p>
          </div>
          <div className="businessCount">
            <strong>{businesses.length}</strong>
            <span>businesses currently listed</span>
          </div>
        </div>
        <div className="businessIskaGrid">
          {businesses.map((item, index) => (
            <article key={item.id}>
              <div className="businessCardTop">
                <div className="businessLogoBox">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt={`${item.name} logo`} />
                  ) : (
                    <span>{item.name.charAt(0)}</span>
                  )}
                </div>
                <small>{String(index + 1).padStart(2, '0')}</small>
              </div>
              <div className="iskaVerifiedLabel">
                <i>✓</i>{' '}
                {item.verification_status || 'LISTED WITH A HETER ISKA'}
              </div>
              <h3 dir={/[֐-׿]/.test(item.name) ? 'rtl' : 'ltr'}>{item.name}</h3>
              {item.category && (
                <small className="businessCategory">{item.category}</small>
              )}
              <p>
                {item.description ||
                  'Listed in the Kav Haribis Heter Iska business directory.'}
              </p>
              {(item.address || item.city) && (
                <address>
                  {[item.address, item.city, item.state, item.zip]
                    .filter(Boolean)
                    .join(', ')}
                </address>
              )}
              {item.iska_authority && (
                <p className="iskaAuthority">
                  <b>Heter Iska authority:</b> {item.iska_authority}
                </p>
              )}
              {item.iska_details && <p>{item.iska_details}</p>}
              {item.public_notes && (
                <p className="businessPublicNote">{item.public_notes}</p>
              )}
              {item.last_verified && (
                <time dateTime={item.last_verified}>
                  Last verified:{' '}
                  {new Date(
                    `${item.last_verified}T00:00:00`,
                  ).toLocaleDateString('en-US')}
                </time>
              )}
              <div className="businessContactLinks">
                {item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}
                {item.email && <a href={`mailto:${item.email}`}>Email</a>}
                {item.website && (
                  <a
                    href={
                      item.website.startsWith('http')
                        ? item.website
                        : `https://${item.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="businessVerificationNotice my-10">
        <div>
          <p className="eyebrow">IMPORTANT GUIDANCE</p>
          <h2>Verify before relying on a listing</h2>
          <p>
            A listing is educational information and does not guarantee that
            every transaction is covered. Confirm that the business’s Heter Iska
            is current, properly executed, and applicable to the specific
            arrangement.
          </p>
        </div>
        <a href="/bais-horaah">Ask the Bais Horaah →</a>
      </section>
      <div className='hidden'>
      <section className="businessSubmissionCallout">
        <div>
          <p className="eyebrow gold">GROW THE DIRECTORY</p>
          <h2>Does your business operate with a Heter Iska?</h2>
          <p>
            Contact Kav Haribis to submit a business for review or to update an
            existing listing.
          </p>
        </div>
        <a className="primary" href="/contact">
          Submit or update a business →
        </a>
      </section>
      </div>
    </InteriorPage>
  );
}
