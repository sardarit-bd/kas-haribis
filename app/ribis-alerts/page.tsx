import { listRibbisAlerts } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
import AlertLibrary from './alert-library';
import SubscriptionForm from './subscription-form';
import TipForm from './tip-form';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { env } = await import('cloudflare:workers'),
    items = (await listRibbisAlerts(env.DB)) as any[];
  const hasFeatured = items.some(
    (x) => x.featured && x.alert_status !== 'Archived',
  );
  return (
    <InteriorPage
      eyebrow="RIBBIS ALERTS"
      title="Know before you sign, lend, borrow, or invest"
      intro="Timely warnings, updated guidance, and directory changes from Kav Haribis—organized so you can quickly understand what deserves attention."
    >
      <section className="alertsHero modern">
        <div>
          <p className="eyebrow gold">COMMUNITY AWARENESS</p>
          <h2>A professional alert center for practical financial concerns</h2>
          <p>
            Search current guidance, open the full details, share important
            notices, and submit information that may help protect the community.
          </p>
        </div>
        <aside>
          <span>!</span>
          <div>
            <strong>
              {items.filter((x) => x.alert_status !== 'Archived').length}
            </strong>
            <b>active notices</b>
            <small>Reviewed and maintained by Kav Haribis.</small>
          </div>
        </aside>
      </section>
      <div className={hasFeatured ? '' : 'noFeatured'}>
        <AlertLibrary items={items} />
      </div>
      <SubscriptionForm />
      <details className="tipDisclosure">
        <summary>
          <span>Have a tip?</span>
          <b>Share information securely</b>
          <i>＋</i>
        </summary>
        <section className="alertTipSubmission">
          <div className="tipIntro">
            <p className="eyebrow gold">SHARE A RIBBIS TIP</p>
            <h2>Tell Kav Haribis what may need review</h2>
            <p>
              This form is specifically for possible Ribbis alerts, directory
              corrections, and financial practices that may affect the
              community.
            </p>
          </div>
          <TipForm />
        </section>
      </details>
      <section className="modernAlertDisclaimer">
        <div>
          <p className="eyebrow">IMPORTANT</p>
          <h2>Alerts do not replace a personal psak</h2>
          <p>
            These notices provide general educational guidance. Speak with a
            qualified Rav before acting when your transaction or circumstances
            may raise a halachic question.
          </p>
        </div>
        <a href="/bais-horaah">Ask the Bais Horaah →</a>
      </section>
    </InteriorPage>
  );
}
