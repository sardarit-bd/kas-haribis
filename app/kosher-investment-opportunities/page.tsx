import { listInvestments } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
const link = (x: string) => (/^https?:\/\//i.test(x || '') ? x : '');
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listInvestments(env.DB)) as any[];
  return (
    <InteriorPage
      eyebrow="KOSHER INVESTING"
      title="Kosher Investment Opportunities"
      intro="Explore investment opportunities together with the practical halachic information and disclosures provided for each listing."
    >
      <div className='hidden'>
      <section className="investHero">
        <div>
          <p className="eyebrow gold">INVEST WITH CLARITY</p>
          <h2>Opportunity information designed for responsible review</h2>
          <p>
            Compare the structure, minimum investment, term, kosher-review
            details, and sponsor information before deciding what deserves
            further due diligence.
          </p>
        </div>
        <aside>
          <span>◆</span>
          <h3>Review before investing</h3>
          <p>
            A listing is educational information—not an endorsement, guarantee,
            or personal investment recommendation.
          </p>
        </aside>
      </section>
      </div>
      <section className="investDirectory my-10" id="investment-opportunities">
        <div className="investHead">
          <div>
            <p className="eyebrow gold">CURRENT LISTINGS</p>
            <h2>Available opportunities</h2>
          </div>
          <strong>
            {items.length}
            <small>published</small>
          </strong>
        </div>
        {items.length ? (
          <div className="investGrid">
            {items.map((x) => (
              <article className={x.featured ? 'featured' : ''} key={x.id}>
                <div className="investCardTop">
                  {x.logo_url ? (
                    <img
                      src={x.logo_url}
                      alt={`${x.sponsor_name || x.opportunity_name} logo`}
                    />
                  ) : (
                    <span>
                      {String(x.sponsor_name || x.opportunity_name || 'IO')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <small>
                      {x.investment_type || 'Investment opportunity'}
                    </small>
                    <h3>{x.opportunity_name}</h3>
                    {x.sponsor_name && <b>Presented by {x.sponsor_name}</b>}
                  </div>
                  <em>{x.availability_status || 'Open'}</em>
                </div>
                <p>
                  {x.description ||
                    'Opportunity details are available from the sponsor.'}
                </p>
                <div className="investFacts">
                  {x.minimum_investment && (
                    <div>
                      <small>MINIMUM</small>
                      <strong>{x.minimum_investment}</strong>
                    </div>
                  )}
                  {x.return_information && (
                    <div>
                      <small>RETURN INFORMATION</small>
                      <strong>{x.return_information}</strong>
                    </div>
                  )}
                  {x.investment_term && (
                    <div>
                      <small>TERM</small>
                      <strong>{x.investment_term}</strong>
                    </div>
                  )}
                  {x.location && (
                    <div>
                      <small>LOCATION</small>
                      <strong>{x.location}</strong>
                    </div>
                  )}
                </div>
                <div className="investKosher">
                  <div>
                    <span>✓</span>
                    <p>
                      <small>{x.kosher_status || 'REVIEWED'}</small>
                      <b>
                        {x.rabbinical_oversight ||
                          'Kosher investment information'}
                      </b>
                    </p>
                    {x.last_reviewed && (
                      <time>
                        {new Date(
                          `${x.last_reviewed}T00:00:00`,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                  </div>
                  {x.kosher_details && <p>{x.kosher_details}</p>}
                </div>
                {x.public_notes && (
                  <p className="investPublicNote">{x.public_notes}</p>
                )}
                {x.risk_disclosure && (
                  <details>
                    <summary>Important risk disclosure</summary>
                    <p>{x.risk_disclosure}</p>
                  </details>
                )}
                <div className="investActions">
                  {link(x.opportunity_url) ? (
                    <a
                      className="primary"
                      href={x.opportunity_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Opportunity ↗
                    </a>
                  ) : (
                    <span>Details link coming soon</span>
                  )}
                  {x.email && <a href={`mailto:${x.email}`}>Contact sponsor</a>}
                  {x.phone && (
                    <a href={`tel:${x.phone.replace(/[^+\d]/g, '')}`}>
                      {x.phone}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="investEmpty">
            <span>◇</span>
            <h2>Opportunities will appear here</h2>
            <p>
              Use the administrator to add and publish the first kosher
              investment opportunity.
            </p>
          </div>
        )}
      </section>
      <section className="investDisclaimer mb-10">
        <div>
          <p className="eyebrow">PLEASE NOTE</p>
          <h2>
            Halachic review and financial due diligence are both essential
          </h2>
          <p>
            Investment opportunities involve risk, including possible loss of
            principal. Confirm all current terms, investigate the sponsor
            independently, review offering documents with your advisers, and ask
            a qualified Rav about your circumstances.
          </p>
        </div>
        <a href="/bais-horaah">Ask a halachic question →</a>
      </section>
    </InteriorPage>
  );
}
