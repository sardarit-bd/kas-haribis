'use client';
import { useEffect, useState } from 'react';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
const offerings = [
  [
    'Directories & Financial Resources',
    'Kosher Bank Directory',
    'Research, current status, public comments, and detailed reports on banks and lenders.',
    '/bank-directory',
    'FINANCIAL RESEARCH',
  ],
  [
    'Directories & Financial Resources',
    'Businesses with a Heter Iska',
    'Find businesses that have provided Heter Iska information to Kav Haribis.',
    '/businesses-with-a-heter-iska',
    'BUSINESS DIRECTORY',
  ],
  [
    'Directories & Financial Resources',
    'Kosher Loan Services',
    'Connect with financing professionals familiar with appropriate kosher structures.',
    '/kosher-loan-service',
    'FINANCING',
  ],
  [
    'Directories & Financial Resources',
    'Investment Opportunities',
    'Review opportunities together with their kosher structure, terms, and disclosures.',
    '/kosher-investment-opportunities',
    'INVESTMENTS',
  ],
  [
    'Directories & Financial Resources',
    'High-Yield Savings',
    'Compare account information, current terms, and direct account-opening links.',
    '/savings',
    'SAVINGS',
  ],
  [
    'Learning',
    'Audio & Video Shiurim',
    'Five-minute series, general shiurim, and video presentations.',
    '/audio',
    'AUDIO & VIDEO',
  ],
  [
    'Learning',
    'Articles & Gilyonos',
    'Practical publications addressing contemporary Ribbis questions.',
    '/articles',
    'PUBLICATIONS',
  ],
  [
    'Learning',
    'Halacha',
    'Clear introductions to frequently encountered areas of Hilchos Ribbis.',
    '/halacha',
    'HALACHA',
  ],
  [
    'Learning',
    'Seforim',
    'Books and learning materials available for purchase and protected download.',
    '/seforim',
    'SEFORIM',
  ],
  [
    'Services & Programs',
    'Heter Iska Library',
    'Preview documents and securely obtain the appropriate downloadable file.',
    '/heter-iska',
    'DOCUMENTS',
  ],
  [
    'Services & Programs',
    'Investment Certification',
    'Submit an investment model, financial structure, and supporting documents for an initial Ribbis assessment and written determination.',
    '/kosher-investment-certification',
    'KASHRUS OF INVESTMENTS',
  ],
  [
    'Services & Programs',
    'Bais Horaah',
    'Submit the relevant details securely. A member of the Bais Horaah team can review your question and respond using your preferred contact information.',
    '/bais-horaah',
    'BAIS HORAAH',
  ],
  [
    'Services & Programs',
    'Programs',
    'Programs for Rabbanim, schools, businesses, professionals, and community groups help turn awareness into responsible practice.',
    '/programs',
    'EDUCATION & OUTREACH',
  ],
  [
    'Services & Programs',
    'Genealogy Services',
    'Kav Haribis has partnered with experienced genealogists to help investigate and clarify potential problematic ownership.',
    '/genealogy-services',
    'RESEARCH SERVICE',
  ],
  [
    'Membership & Support',
    'Kav Haribis Membership',
    'Register free, select newsletters and alerts, manage your preferences, and keep future seforim orders organized in your private member account.',
    '/membership',
    'FREE MEMBERSHIP',
  ],
  [
    'Membership & Support',
    'Ribbis Alerts',
    'Important notices about common financial arrangements, updated guidance and directory changes.',
    '/ribis-alerts',
    'COMMUNITY UPDATES',
  ],
  [
    'Membership & Support',
    'Donate',
    'Help expand Torah education and responsible financial guidance.',
    '/donate',
    'SUPPORT THE MISSION',
  ],
] as const;
const pictures: Record<string, string> = {
  'Kosher Bank Directory': '/kav-brand/bank-research.png',
  'Businesses with a Heter Iska': '/business-logos/katz-furniture.png',
  'Kosher Loan Services': '/kav-impact/financial-outreach.jpg',
  'Investment Opportunities': '/kav-brand/investments-hero.png',
  'High-Yield Savings': '/kav-impact/business-visit.jpg',
  'Audio & Video Shiurim': '/kav-brand/audio-hero.png',
  'Articles & Gilyonos': '/kav-brand/articles-hero.png',
  Halacha: '/article-covers/2449.jpg',
  Seforim: '/kav-brand/seforim-hero.png',
  'Heter Iska Library': '/kav-brand/heter-iska.png',
  'Investment Certification': '/kav-impact/heter-iska-presentation.jpg',
  'Bais Horaah': '/kav-brand/bais-horaah.png',
  Programs: '/kav-impact/student-shiur.jpg',
  'Genealogy Services': '/genealogy-hero.png',
  'Kav Haribis Membership': '/kav-impact/community-event.jpg',
  'Ribbis Alerts': '/kav-impact/recognition-event.jpg',
  Donate: '/kav-impact/heter-iska-presentation-2.jpg',
};
const groups = [
  'Directories & Financial Resources',
  'Learning',
  'Services & Programs',
  'Membership & Support',
];
const groupClass = (name: string) =>
  name.startsWith('Directories')
    ? 'directory'
    : name === 'Learning'
      ? 'learning'
      : name.startsWith('Services')
        ? 'services'
        : 'support';
const groupIcon = (name: string) =>
  name.startsWith('Directories')
    ? '⌂'
    : name === 'Learning'
      ? 'א'
      : name.startsWith('Services')
        ? 'KH'
        : '♥';
export default function Preview() {
  const [group, setGroup] = useState(groups[0]),
    [active, setActive] = useState(0);
  const visible = offerings.filter((x) => x[0] === group);
  useEffect(() => setActive(0), [group]);
  useEffect(() => {
    const t = setInterval(
      () => setActive((v) => (v + 1) % visible.length),
      4500,
    );
    return () => clearInterval(t);
  }, [group, visible.length]);
  const item = visible[active],
    theme = groupClass(group);
  return (
    <main className="motionPreview">
      <SiteHeader />
      <div className="motionPreviewOnly">
        <b>HOMEPAGE MOVEMENT PREVIEW</b>
        <span>
          This is a separate demonstration. The live homepage has not been
          changed.
        </span>
        <a href="/">Return to current homepage →</a>
      </div>
      <section className="motionHero">
        <img
          src="/kav-brand/home-hero.png"
          alt="A study desk combining Torah learning and financial research"
        />
        <div className="motionHeroShade"></div>
        <div className="motionHeroCopy">
          <p className="eyebrow">A CENTER FOR HILCHOS RIBBIS</p>
          <h1>Torah clarity for a complex financial world.</h1>
          <p>
            Kav Haribis brings practical guidance, trusted research, and
            accessible learning resources to individuals, families, businesses,
            and communities.
          </p>
          <div>
            <a className="primary" href="/bank-directory">
              Explore the Bank Directory
            </a>
            <a href="/bais-horaah">Ask the Bais Horaah →</a>
          </div>
        </div>
        <aside className="previewSeal">
          <div>
            <span>היתר</span>
            <b>עיסקא</b>
            <i>KAV HARIBIS</i>
          </div>
          <small>Torah guidance for responsible commerce</small>
        </aside>
      </section>
      <section className={`motionServiceStage theme-${theme}`}>
        <header>
          <div>
            <p className="eyebrow gold">EVERYTHING WE OFFER</p>
            <h2>
              Directories, learning, services, programs, membership, and
              support.
            </h2>
          </div>
          <p>
            Choose a group, then clearly explore every Kav Haribis offering.
          </p>
        </header>
        <div className="offeringGroups">
          {groups.map((name) => (
            <button
              className={`${groupClass(name)} ${name === group ? 'active' : ''}`}
              onClick={() => setGroup(name)}
              key={name}
            >
              <span>{groupIcon(name)}</span>
              {name}
            </button>
          ))}
        </div>
        <div className={`motionFeature ${theme}`} key={`${group}-${active}`}>
          <div className="motionFeatureNumber">
            {String(active + 1).padStart(2, '0')}
          </div>
          <div className="motionFeatureCopy">
            <small>{item[4]}</small>
            <h3>{item[1]}</h3>
            <p>{item[2]}</p>
            <a href={item[3]}>Explore this resource →</a>
          </div>
          <div className="motionFeatureArt vividFeatureArt">
            <img src={pictures[item[1]]} alt="" />
            <div className="vividFeatureShade"></div>
            <div className="featureSeal">
              <span>{groupIcon(group)}</span>
              <i>קו הריבית</i>
            </div>
            <b>{item[1]}</b>
            <small>{group}</small>
          </div>
        </div>
        <nav>
          {visible.map((x, i) => (
            <button
              className={i === active ? 'active' : ''}
              onClick={() => setActive(i)}
              key={x[1]}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{x[1]}</b>
              <i></i>
            </button>
          ))}
        </nav>
      </section>
      <section className="motionTicker">
        <div>
          {[...offerings, ...offerings].map((x, i) => (
            <a href={x[3]} key={`${x[1]}-${i}`}>
              <span>KH</span>
              <b>{x[1]}</b>
              <i>→</i>
            </a>
          ))}
        </div>
      </section>
      <section
        className="motionCounters"
        aria-label="Kav Haribis resource highlights"
      >
        <div>
          <strong>17</strong>
          <span>Resources &amp; services</span>
        </div>
        <div>
          <strong>7</strong>
          <span>Bank status levels</span>
        </div>
        <div>
          <strong>16+</strong>
          <span>Articles &amp; gilyonos</span>
        </div>
        <div>
          <strong>4</strong>
          <span>Learning formats</span>
        </div>
      </section>
      <section className="motionLatest">
        <header>
          <div>
            <p className="eyebrow gold">LATEST FROM KAV HARIBIS</p>
            <h2>New guidance, learning, and community updates.</h2>
          </div>
          <p>
            Fresh content can appear here automatically and gently move into
            view without overwhelming the homepage.
          </p>
        </header>
        <div>
          <a href="/articles">
            <small>RECENT PUBLICATION</small>
            <b>Articles &amp; Gilyonos</b>
            <span>Read the latest practical Torah guidance →</span>
          </a>
          <a href="/audio">
            <small>LISTEN &amp; WATCH</small>
            <b>Audio &amp; Video Shiurim</b>
            <span>Explore five-minute series and general shiurim →</span>
          </a>
          <a href="/ribis-alerts">
            <small>COMMUNITY UPDATE</small>
            <b>Ribbis Alerts</b>
            <span>Review current notices and guidance →</span>
          </a>
        </div>
      </section>
      <section className="motionLearning">
        <header>
          <div>
            <p className="eyebrow gold">ALL KAV HARIBIS OFFERINGS</p>
            <h2>See every resource clearly</h2>
          </div>
        </header>
        <div className="allOfferingCards">
          {offerings.map((x, i) => (
            <a
              className={`offerCard ${groupClass(x[0])}`}
              href={x[3]}
              key={x[1]}
            >
              <figure>
                <img src={pictures[x[1]]} alt="" />
                <span>{groupIcon(x[0])}</span>
              </figure>
              <div>
                <small>{x[0]}</small>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
                <b>Explore →</b>
              </div>
              <em>{String(i + 1).padStart(2, '0')}</em>
            </a>
          ))}
        </div>
      </section>
      <section className="motionPhotoStory">
        <div>
          <img
            src="/kav-impact/student-shiur.jpg"
            alt="Kav Haribis student education program"
          />
          <span>STUDENT EDUCATION</span>
        </div>
        <div>
          <img
            src="/kav-impact/heter-iska-presentation.jpg"
            alt="Kav Haribis Heter Iska outreach"
          />
          <span>BUSINESS OUTREACH</span>
        </div>
        <div>
          <img
            src="/kav-impact/financial-outreach.jpg"
            alt="Kav Haribis financial industry outreach"
          />
          <span>FINANCIAL EDUCATION</span>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
