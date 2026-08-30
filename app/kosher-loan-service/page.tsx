import { listLoanServices } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listLoanServices(env.DB)) as any[];
  return (
    <InteriorPage
      eyebrow="HALACHICALLY RESPONSIBLE FINANCING"
      title="Kosher Loan Services"
      intro="Reliable brokers. Kosher deals. Peace of mind. Connect with professionals who understand the importance of arranging financing in accordance with Hilchos Ribbis."
    >
      <section className="loanServiceIntro">
        <div>
          <p className="eyebrow gold">FINANCING WITH CLARITY</p>
          <h2>Find the right loan professional—without compromising halacha</h2>
          <p>
            Navigating loans while staying fully within halacha can be complex.
            These professionals understand the importance of kosher loan
            structures and arranging a proper Heter Iska where needed.
          </p>
          <a className="primary" href="#loan-services">
            View loan services ↓
          </a>
        </div>
        <aside>
          <span>₪</span>
          <h3>Before signing a loan</h3>
          <p>
            Confirm the identity of the actual lender, where the loan funds
            originate, whether the loan may be sold, and that any Heter Iska
            applies to your specific transaction.
          </p>
          <a href="/bais-horaah">Ask the Bais Horaah →</a>
        </aside>
      </section>
      <section className="loanServicesDirectory" id="loan-services">
        <div className="loanDirectoryHead">
          <div>
            <p className="eyebrow gold">TRUSTED PROFESSIONALS</p>
            <h2>Featured loan services</h2>
            <p>
              Each listing includes the information currently available to Kav
              Haribis. Always verify the details before relying on a listing.
            </p>
          </div>
          <strong>
            {items.length}
            <small>services listed</small>
          </strong>
        </div>
        <div className="loanServiceGrid">
          {items.map((x, i) => (
            <article className={x.featured ? 'featured' : ''} key={x.id}>
              <div className="loanCardTop">
                {x.logo_url ? (
                  <img src={x.logo_url} alt={`${x.name} logo`} />
                ) : (
                  <span>{x.name.charAt(0)}</span>
                )}
                <small>{String(i + 1).padStart(2, '0')}</small>
              </div>
              <div className="loanStatus">
                <i>✓</i>
                {x.verification_status || 'Listed service'}
              </div>
              <h3>{x.name}</h3>
              {x.service_type && <b className="loanType">{x.service_type}</b>}
              <p>{x.description}</p>
              {x.specialties && (
                <p>
                  <b>Specialties:</b> {x.specialties}
                </p>
              )}
              {x.rabbinical_oversight && (
                <div className="oversight">
                  <small>RABBINICAL OVERSIGHT</small>
                  <b>{x.rabbinical_oversight}</b>
                </div>
              )}
              {x.kosher_details && (
                <p className="kosherDetails">{x.kosher_details}</p>
              )}
              <dl>
                {x.contact_name && (
                  <>
                    <dt>Contact</dt>
                    <dd>{x.contact_name}</dd>
                  </>
                )}
                {(x.city || x.state) && (
                  <>
                    <dt>Location</dt>
                    <dd>{[x.city, x.state].filter(Boolean).join(', ')}</dd>
                  </>
                )}
                {x.service_area && (
                  <>
                    <dt>Service area</dt>
                    <dd>{x.service_area}</dd>
                  </>
                )}
              </dl>
              {x.public_notes && (
                <p className="loanPublicNote">{x.public_notes}</p>
              )}
              {x.last_verified && (
                <time dateTime={x.last_verified}>
                  Last verified:{' '}
                  {new Date(`${x.last_verified}T00:00:00`).toLocaleDateString(
                    'en-US',
                  )}
                </time>
              )}
              <div className="loanContactActions">
                {x.phone && (
                  <a className="primary" href={`tel:${x.phone}`}>
                    Call {x.phone}
                  </a>
                )}
                {x.email && <a href={`mailto:${x.email}`}>Email</a>}
                {x.website && (
                  <a
                    href={
                      x.website.startsWith('http')
                        ? x.website
                        : `https://${x.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 && (
          <div className="loanEmpty">
            <h3>Listings are being prepared</h3>
            <p>Please contact Kav Haribis for guidance in the meantime.</p>
          </div>
        )}
      </section>
      <section className="loanServiceDisclaimer">
        <div>
          <p className="eyebrow">IMPORTANT</p>
          <h2>Every loan must be reviewed individually</h2>
          <p>
            A listed broker or service does not automatically make every
            transaction permissible. The lender, funding source, documents, and
            Heter Iska must be appropriate for the specific loan.
          </p>
        </div>
        <a href="/bais-horaah">Review your loan with the Bais Horaah →</a>
      </section>
      <section className="loanServiceSubmit">
        <div>
          <p className="eyebrow gold">EXPAND THE DIRECTORY</p>
          <h2>Know a broker who arranges kosher loans?</h2>
          <p>
            Send Kav Haribis the broker’s information so it can be reviewed for
            inclusion.
          </p>
        </div>
        <a className="primary" href="/contact">
          Recommend a loan professional →
        </a>
      </section>
    </InteriorPage>
  );
}
