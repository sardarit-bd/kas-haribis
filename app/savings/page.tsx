import { listSavingsAccounts } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
export const dynamic = 'force-dynamic';
const safeLink = (value: string) =>
  /^https?:\/\//i.test(value || '') ? value : '';
export default async function SavingsPage() {
  const { env } = await import('cloudflare:workers'),
    items = (await listSavingsAccounts(env.DB)) as any[];
  return (
    <InteriorPage
      eyebrow="SAVINGS RESEARCH"
      title="Kosher High-Yield Savings Accounts"
      intro="Compare savings opportunities together with the practical information Kav Haribis has reviewed. Rates and terms can change, so verify the current details before opening an account."
    >
      <section className="savingsHero">
        <div>
          <p className="eyebrow gold">SAVE WITH CLARITY</p>
          <h2>A modern directory for informed decisions</h2>
          <p>
            Review account terms, kosher-status information, minimum deposits,
            fees, and direct account-opening links in one place.
          </p>
        </div>
        <aside>
          <strong>{items.length}</strong>
          <span>account{items.length === 1 ? '' : 's'} listed</span>
          <small>Information should be reconfirmed with the institution.</small>
        </aside>
      </section>
      <section className="savingsDirectory">
        <div className="savingsDirectoryHead">
          <div>
            <p className="eyebrow gold">AVAILABLE ACCOUNTS</p>
            <h2>Compare high-yield savings options</h2>
          </div>
          <p>
            Kav Haribis provides educational research. A listing is not
            financial advice or a guarantee of current rates.
          </p>
        </div>
        <div className="savingsGrid">
          {items.map((x) => {
            const link = safeLink(x.open_account_url);
            return (
              <article className={x.featured ? 'featured' : ''} key={x.id}>
                <div className="savingsCardTop">
                  {x.logo_url ? (
                    <img src={x.logo_url} alt={`${x.institution_name} logo`} />
                  ) : (
                    <span>
                      {String(x.institution_name || 'S')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <small>{x.kosher_status || 'Review available'}</small>
                    <h3>{x.institution_name}</h3>
                    <b>{x.account_name || 'High-Yield Savings Account'}</b>
                  </div>
                  {x.apy && (
                    <em>
                      <strong>{x.apy}</strong>
                      <small>APY</small>
                    </em>
                  )}
                </div>
                <p>
                  {x.description ||
                    'Savings-account information reviewed by Kav Haribis.'}
                </p>
                <dl>
                  {x.minimum_deposit && (
                    <>
                      <dt>Minimum deposit</dt>
                      <dd>{x.minimum_deposit}</dd>
                    </>
                  )}
                  {x.monthly_fee && (
                    <>
                      <dt>Monthly fee</dt>
                      <dd>{x.monthly_fee}</dd>
                    </>
                  )}
                  {x.fdic_status && (
                    <>
                      <dt>Deposit insurance</dt>
                      <dd>{x.fdic_status}</dd>
                    </>
                  )}
                  {x.last_reviewed && (
                    <>
                      <dt>Last reviewed</dt>
                      <dd>
                        {new Date(
                          `${x.last_reviewed}T00:00:00`,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </dd>
                    </>
                  )}
                </dl>
                {x.kosher_details && (
                  <div className="savingsKosherNote">
                    <small>KOSHER ACCOUNT INFORMATION</small>
                    <p>{x.kosher_details}</p>
                  </div>
                )}
                {x.public_notes && (
                  <p className="savingsPublicNote">{x.public_notes}</p>
                )}
                <div className="savingsActions">
                  {link ? (
                    <a
                      className="primary"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open an Account ↗
                    </a>
                  ) : (
                    <span>Account-opening link coming soon</span>
                  )}
                  {safeLink(x.website) && x.website !== link && (
                    <a
                      href={x.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Institution website
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="savingsDisclaimer">
        <div>
          <p className="eyebrow">IMPORTANT</p>
          <h2>Confirm terms before depositing funds</h2>
          <p>
            Interest rates, fees, eligibility, and account structures can
            change. Review the institution’s current disclosures and ask a
            qualified Rav when a personal halachic question applies.
          </p>
        </div>
        <a href="/bais-horaah">Ask a Ribbis question →</a>
      </section>
    </InteriorPage>
  );
}
