import { SiteFooter, SiteHeader } from '../shared/site-shell';
import ServiceRotator from '../shared/service-rotator';

const actions = [
  {
    number: '01',
    icon: '⌕',
    title: 'Check a bank',
    text: 'Search financial institutions',
    href: '/bank-directory',
    theme: 'bank',
  },
  {
    number: '02',
    icon: 'שטר',
    title: 'Find a Heter Iska',
    text: 'Preview available documents',
    href: '/heter-iska',
    theme: 'heter',
  },
  {
    number: '03',
    icon: '?',
    title: 'Ask a question',
    text: 'Contact the Bais Horaah',
    href: '/bais-horaah',
    theme: 'question',
  },
  {
    number: '04',
    icon: '!',
    title: 'View Ribbis Alerts',
    text: 'Current community information',
    href: '/ribis-alerts',
    theme: 'alerts',
  },
];

export default function QuickActionsPreview() {
  return (
    <main className="quickPreviewPage">
      <SiteHeader />
      <section className="homeHero">
        <img
          className="homeHeroImage"
          src="/kav-brand/home-hero.png"
          alt="A study desk combining Torah learning and financial research"
        />
        <div className="homeHeroCopy">
          <p className="eyebrow">A CENTER FOR HILCHOS RIBBIS</p>
          <h1>Torah clarity for a complex financial world.</h1>
          <p>
            Kav Haribis brings practical guidance, trusted research, and
            accessible learning resources to individuals, families, businesses,
            and communities.
          </p>
          <div className="homeHeroActions">
            <a className="primary" href="/bank-directory">
              Explore the Bank Directory
            </a>
            <a href="/bais-horaah">Ask the Bais Horaah →</a>
          </div>
          <div className="homeTrustLine">
            <span>Research</span>
            <i></i>
            <span>Halachic guidance</span>
            <i></i>
            <span>Education</span>
            <i></i>
            <span>Community resources</span>
          </div>
        </div>
        <aside className="homeHeroPanel">
          <div className="homeHeroSeal">
            <span>KH</span>
          </div>
          <small>קו הריבית</small>
          <h2>Clarity in Hilchos Ribbis</h2>
          <p>
            Practical resources for responsible commerce and everyday financial
            decisions.
          </p>
          <a href="/about-us">About Kav Haribis →</a>
          <ServiceRotator />
        </aside>
      </section>
      <section
        className="quickPreviewStrip"
        aria-label="Popular Kav Haribis services"
      >
        {actions.map((action) => (
          <a
            className={`quickPreviewCard ${action.theme}`}
            href={action.href}
            key={action.number}
          >
            <span className="quickPreviewNumber">{action.number}</span>
            <i>{action.icon}</i>
            <div>
              <b>{action.title}</b>
              <small>{action.text}</small>
            </div>
            <strong>→</strong>
            <em></em>
          </a>
        ))}
      </section>
      <section className="quickPreviewNote">
        <small>PREVIEW ONLY</small>
        <p>
          This page demonstrates the redesigned four-link section. No other
          homepage area has been changed.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
