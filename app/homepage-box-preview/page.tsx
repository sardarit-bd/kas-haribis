'use client';
import { FormEvent, useEffect, useState } from 'react';
import ServiceRotator from '../shared/service-rotator';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import SubscriptionForm from '../ribis-alerts/subscription-form';

const offerings = [
  [
    'Kosher Bank Directory',
    'Research banks and lenders',
    '/bank-directory',
    '⌕',
    'blue',
  ],
  [
    'Businesses with a Heter Iska',
    'Browse the business directory',
    '/businesses-with-a-heter-iska',
    '✓',
    'green',
  ],
  [
    'Kosher Loan Services',
    'Find appropriate financing resources',
    '/kosher-loan-service',
    '₪',
    'gold',
  ],
  [
    'Investment Opportunities',
    'Review kosher investment information',
    '/kosher-investment-opportunities',
    '↗',
    'purple',
  ],
  [
    'High-Yield Savings',
    'Compare savings-account information',
    '/savings',
    '%',
    'aqua',
  ],
  [
    'Heter Iska Library',
    'Preview and obtain documents',
    '/heter-iska',
    'שטר',
    'gold',
  ],
  ['Bais Horaah', 'Submit a Ribbis question', '/bais-horaah', '?', 'green'],
  ['Audio & Video Shiurim', 'Listen and learn', '/audio', '▶', 'blue'],
  [
    'Articles & Gilyonos',
    'Read practical Torah guidance',
    '/articles',
    'א',
    'purple',
  ],
  ['Halacha', 'Explore practical Hilchos Ribbis', '/halacha', '§', 'gold'],
  ['Seforim', 'Browse Kav Haribis publications', '/seforim', 'ס', 'blue'],
  [
    'Investment Certification',
    'Request a structured review',
    '/kosher-investment-certification',
    'KH',
    'green',
  ],
  ['Programs', 'Education and community outreach', '/programs', '✦', 'purple'],
  [
    'Genealogy Services',
    'Research potential ownership concerns',
    '/genealogy-services',
    '⌘',
    'aqua',
  ],
  [
    'Kav Haribis Membership',
    'Join free and manage preferences',
    '/membership',
    '◎',
    'blue',
  ],
  [
    'Ribbis Alerts',
    'View important community updates',
    '/ribis-alerts',
    '!',
    'red',
  ],
  ['Donate', 'Support the Kav Haribis mission', '/donate', '♥', 'gold'],
  [
    'Educational Center',
    'Coloring pages, pamphlets, and school resources',
    '/educational-center',
    '✎',
    'aqua',
  ],
] as const;
const previewLearning = [
  [
    'Audio & Video Shiurim',
    'Five-minute series, general shiurim, and video presentations.',
    '/audio',
    '▶',
  ],
  [
    'Articles & Gilyonos',
    'Practical publications addressing contemporary Ribbis questions.',
    '/articles',
    'א',
  ],
  [
    'Halacha',
    'Clear introductions to frequently encountered areas of Hilchos Ribbis.',
    '/halacha',
    '§',
  ],
  [
    'Seforim',
    'Books and learning materials available for purchase and protected download.',
    '/seforim',
    'ס',
  ],
] as const;
const offeringImages = [
  ['/kav-impact/community-event.jpg', 'Community education and outreach'],
  ['/kav-impact/student-shiur.jpg', 'Teaching practical Hilchos Ribbis'],
  ['/kav-impact/financial-outreach.jpg', 'Responsible financial guidance'],
  [
    '/kav-impact/heter-iska-presentation.jpg',
    'Heter Iska awareness and presentation',
  ],
  [
    '/kav-impact/recognition-event.jpg',
    'Kav Haribis programs in the community',
  ],
] as const;

export default function BoxPreview({
  cardsPreview = false,
}: {
  cardsPreview?: boolean;
}) {
  const [active, setActive] = useState(0),
    [reference, setReference] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % offerings.length),
      1900,
    );
    return () => clearInterval(timer);
  }, []);
  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget,
      data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        }),
        result = (await response.json()) as any;
      if (!response.ok || !result.reference)
        throw new Error(result.error || 'The question could not be submitted.');
      setReference(result.reference);
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'The question could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className={`boxFlashPreview modernHome ${cardsPreview ? 'cardsPreviewMode' : ''}`}
    >
      <SiteHeader />
      {cardsPreview && (
        <div className="cardsPreviewNotice">
          <b>18-CARD PREVIEW ONLY</b>
          <span>
            Only the offering cards and the small information counters below are
            different.
          </span>
          <a href="/">Return to current homepage →</a>
        </div>
      )}
      <section className="homeHero">
        <img
          className="homeHeroImage"
          src="/kav-brand/home-hero.png"
          alt="A study desk combining Torah learning and financial research"
        />
       
         <div className="homeHeroCopy lg:pl-7">
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
        <aside className="homeHeroPanel lg:mr-7">
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
      <div className='hidden'>
      <nav
        className="quickPreviewStrip liveQuickActions"
        aria-label="Popular Kav Haribis services"
      >
        <a className="quickPreviewCard bank" href="/bank-directory">
          <span className="quickPreviewNumber">01</span>
          <i>⌕</i>
          <div>
            <b>Check a bank</b>
            <small>Search financial institutions</small>
          </div>
          <strong>→</strong>
          <em></em>
        </a>
        <a className="quickPreviewCard heter" href="/heter-iska">
          <span className="quickPreviewNumber">02</span>
          <i>שטר</i>
          <div>
            <b>Find a Heter Iska</b>
            <small>Preview available documents</small>
          </div>
          <strong>→</strong>
          <em></em>
        </a>
        <a className="quickPreviewCard question" href="/bais-horaah">
          <span className="quickPreviewNumber">03</span>
          <i>?</i>
          <div>
            <b>Ask a question</b>
            <small>Contact the Bais Horaah</small>
          </div>
          <strong>→</strong>
          <em></em>
        </a>
        <a className="quickPreviewCard alerts" href="/ribis-alerts">
          <span className="quickPreviewNumber">04</span>
          <i>!</i>
          <div>
            <b>View Ribbis Alerts</b>
            <small>Current community information</small>
          </div>
          <strong>→</strong>
          <em></em>
        </a>
      </nav>
      </div>
      <section className="container ">

        <div className='flex flex-col lg:flex-row items-center gap-10 py-20 px-4 md:px-10 lg:px-10 xl:px-0'>
        <div>
          <div className="previewMissionHeading">
          <p className="eyebrow gold">OUR MISSION</p>
          <h2>
            Making Hilchos Ribbis understandable, accessible, and practical.
          </h2>
        </div>
        <div className="previewMissionCopy">
          <p>
            Modern financial arrangements can involve mortgages, business
            financing, investments, payment plans, banking products, and
            partnerships. Each may require careful Halachic consideration.
          </p>
          <p>
            Kav Haribis combines Torah education with practical research so that
            questions can be recognized early and addressed responsibly.
          </p>
          <a className='pt-6 font-bold' href="/about-us">Learn about the organization →</a>
        </div>
        </div>
        <figure>
          <img
            className='homemissionimage'
            src="/kav-brand/mission-visual-v2.png"
            alt="A traditional library passage opening toward a modern financial district"
          />
        </figure>
        </div>
      </section>
      {cardsPreview && (
        <section
          className="cardsPreviewCounters"
          aria-label="Kav Haribis highlights"
        >
          <div>
            <strong>18</strong>
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
      )}
      <section className="flashOfferings groupedOfferings">
        <header>
          <div>
            <p className="eyebrow gold">ALL 18 KAV HARIBIS OFFERINGS</p>
            <h2>Everything we offer—alive, clear, and easy to explore.</h2>
          </div>
          <div className="flashLive">
            <i></i>
            <span>Now highlighting</span>
            <b>{offerings[active][0]}</b>
          </div>
        </header>
        <div className="offeringGroups">
          {offeringImages.map((visual, groupIndex) => {
            const group = offerings.slice(groupIndex * 4, groupIndex * 4 + 4);
            if (!group.length) return null;
            return (
              <div className="offeringGroup" key={visual[0]}>
                <div className="offeringGroupGrid">
                  {group.map((item, itemIndex) => {
                    const index = groupIndex * 4 + itemIndex;
                    return (
                      <a
                        className={`flashOffering ${item[4]} ${index === active ? 'active' : ''}`}
                        href={item[2]}
                        key={item[0]}
                      >
                        <span className="flashNumber">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <i>{item[3]}</i>
                        <div>
                          <b>{item[0]}</b>
                          <small>{item[1]}</small>
                        </div>
                        <strong>→</strong>
                        <em></em>
                      </a>
                    );
                  })}
                </div>
                <figure>
                  <img src={visual[0]} alt={visual[1]} />
                  <figcaption>
                    <span>KAV HARIBIS IN ACTION</span>
                    <b>{visual[1]}</b>
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>
      </section>
      <section className=" bg-[#e9dfca] ">
      <section className="homeCertification container">
        <div>
          <small>KASHRUS OF INVESTMENTS</small>
          <h2>Request a structured investment certification review.</h2>
          <p>
            Submit an investment model, financial structure, and supporting
            documents for an initial Ribbis assessment and written
            determination.
          </p>
          <a className="primary" href="/kosher-investment-certification">
            Learn about certification →
          </a>
        </div>
        <aside>
          <span>
            01 <b>Structure</b>
          </span>
          <span>
            02 <b>Documents</b>
          </span>
          <span>
            03 <b>Halachic review</b>
          </span>
          <span>
            04 <b>Written outcome</b>
          </span>
        </aside>
      </section>
      </section>
      <section className="homeBankFeature">
        <div className="homeBankVisual">
          <div className="researchLines">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="bankFeatureCard">
            <small>KOSHER BANK RESEARCH</small>
            <b>Search. Review. Understand.</b>
            <p>
              Directory statuses, public comments, update dates, and optional
              detailed reports.
            </p>
          </div>
        </div>
        <div className="homeBankCopy">
          <p className="eyebrow gold">KOSHER BANK DIRECTORY</p>
          <h2>Financial research for informed Halachic decisions.</h2>
          <p>
            Search hundreds of banks, lenders, and financial institutions.
            Choose list or grid view, review the current classification, and
            submit new information directly to the research team.
          </p>
          <ul>
            <li>Alphabetized, searchable listings</li>
            <li>Last-reviewed dates and public comments</li>
            <li>Protected full research reports</li>
            <li>Community information-submission system</li>
          </ul>
          <a className="primary" href="/bank-directory">
            Open the Bank Directory
          </a>
        </div>
      </section>
      <section className="homeLearning">
        <div className="homeSectionHeading">
          <div>
            <p className="eyebrow gold">LEARN &amp; GROW</p>
            <h2>Torah resources for every level</h2>
          </div>
          <a href="/audio">Browse all shiurim →</a>
        </div>
        <div className="homeLearningGrid">
          {previewLearning.map((item) => (
            <a href={item[2]} key={item[0]}>
              <span>{item[3]}</span>
              <div>
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
                <b>Explore →</b>
              </div>
            </a>
          ))}
        </div>
      </section>
      <div className='hidden'>
        <section className="boxPreviewMembership">
        <div className="boxPreviewMembershipCopy">
          <p className="eyebrow gold">KAV HARIBIS MEMBERSHIP</p>
          <h2>Your Kav Haribis membership, all in one place.</h2>
          <p>
            Register free, select newsletters and alerts, manage your
            preferences, and keep future seforim orders organized in your
            private member account.
          </p>
          <div className="boxPreviewButtons">
            <a className="primary" href="/membership">
              Explore membership
            </a>
            <a href="/membership/account">Member login →</a>
          </div>
        </div>
        <aside className=''>
          <span>FREE MEMBERSHIP</span>
          <b>
            Read.
            <br />
            Learn.
            <br />
            Stay connected.
          </b>
          <small>Newsletters · Alerts · Orders</small>
        </aside>
      </section>
    
      <section className="boxPreviewPrograms">
        <div className="boxPreviewProgramsCopy">
          <p className="eyebrow gold">EDUCATION &amp; OUTREACH</p>
          <h2>Bring practical Hilchos Ribbis education to your community.</h2>
          <p>
            Programs for Rabbanim, schools, businesses, professionals, and
            community groups help turn awareness into responsible practice.
          </p>
          <div className="boxPreviewButtons">
            <a className="primary" href="/programs">
              Explore programs
            </a>
            <a href="/contact">Request a program →</a>
          </div>
        </div>
        <aside>
          <article>
            <span>01</span>
            <div>
              <b>Rabbinical training</b>
              <p>Advanced preparation for complex, practical questions.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <b>Business assessment</b>
              <p>Reviews of agreements, policies, and financial structures.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <b>Community education</b>
              <p>Shiurim and presentations for schools and kehillos.</p>
            </div>
          </article>
        </aside>
      </section>
      </div>
      <section className="homeImpactStrip container">
        <a href="/programs">
          <img
            src="/kav-impact/student-shiur.jpg"
            alt="Kav Haribis student education program"
          />
          <span>STUDENT EDUCATION</span>
        </a>
        <a href="/programs">
          <img
            src="/kav-impact/heter-iska-presentation.jpg"
            alt="Kav Haribis Heter Iska outreach"
          />
          <span>BUSINESS OUTREACH</span>
        </a>
        <a href="/programs">
          <img
            src="/kav-impact/financial-outreach.jpg"
            alt="Kav Haribis financial industry outreach"
          />
          <span>FINANCIAL EDUCATION</span>
        </a>
      </section>

      <section className="homeFinalCta">
        <div>
          <p className="eyebrow gold">SUPPORT THE MISSION</p>
          <h2>
            Help expand Torah education and responsible financial guidance.
          </h2>
        </div>
        <div>
          <a className="primary" href="/contact">
            Contact Kav Haribis →
          </a>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubscriptionForm />
      </div>
      <SiteFooter showHeterNotice />
    </main>
  );
}
