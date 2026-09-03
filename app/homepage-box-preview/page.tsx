'use client';
import { FormEvent, useEffect, useState } from 'react';
import SubscriptionForm from '../ribis-alerts/subscription-form';
import FeaturedSeforim from '../shared/featured-seforim';
import LandingFaq from '../shared/landing-faq';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

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

const impactRow1 = [
  { title: 'STUDENT EDUCATION', src: '/kav-impact/student-shiur.jpg' },
  { title: 'BUSINESS OUTREACH', src: '/kav-impact/heter-iska-presentation.jpg' },
  { title: 'FINANCIAL EDUCATION', src: '/kav-impact/financial-outreach.jpg' },
  { title: 'COMMUNITY OUTREACH', src: '/kav-impact/community-event.jpg' },
];

const impactRow2 = [
  { title: 'COMMERCIAL ADVISORY', src: '/kav-impact/business-visit.jpg' },
  { title: 'RABBINIC RECOGNITION', src: '/kav-impact/recognition-event.jpg' },
  { title: 'HETER ISKA ADVISORY', src: '/kav-impact/heter-iska-presentation-2.jpg' },
  { title: 'TORAH LECTURES', src: '/kav-impact/student-shiur.jpg' },
];

const mainOfferingsCategories = [
  {
    title: 'Directories',
    icon: '⌕',
    eyebrow: 'Verified Lists & Directories',
    description: 'Explore verified kosher financial institutions, businesses with Heter Iska, and savings opportunities.',
    links: [
      { name: 'Kosher Banks Directory', href: '/bank-directory' },
      { name: 'Businesses with a Heter Iska', href: '/businesses-with-a-heter-iska' },
      { name: 'Kosher Loan Services', href: '/kosher-loan-service' },
      { name: 'Investment Opportunities', href: '/kosher-investment-opportunities' },
      { name: 'Kosher Savings Programs', href: '/savings' },
    ],
  },
  {
    title: 'Learning & Resources',
    icon: '📚',
    eyebrow: 'Shiurim, Seforim & Guides',
    description: 'Comprehensive Torah education materials, audio shiurim, halachic guides, and publications catalog.',
    links: [
      { name: 'Educational Center', href: '/educational-center' },
      { name: 'Audio & Shiurim', href: '/audio' },
      { name: 'Articles & Guides', href: '/articles' },
      { name: 'Common Questions', href: '/questions' },
      { name: 'Seforim Store', href: '/seforim' },
      { name: 'Reading Circle', href: '/reading-circle' },
      { name: 'Kav Haribis Membership', href: '/membership' },
    ],
  },
  {
    title: 'Services & Programs',
    icon: '⚖️',
    eyebrow: 'Advisory & Certification',
    description: 'Professional Bais Horaah consultation, Heter Iska drafting, community outreach, and urgent alerts.',
    links: [
      { name: 'Heter Iska Advisory', href: '/heter-iska' },
      { name: 'Bais Horaah Consultation', href: '/bais-horaah' },
      { name: 'Genealogy Services', href: '/genealogy-services' },
      { name: 'Community Programs', href: '/programs' },
      { name: 'Investment Certification', href: '/kosher-investment-certification' },
      { name: 'Ribbis Alerts', href: '/ribis-alerts' },
    ],
  },
];

const heroSlides = [
  {
    id: 1,
    image: '/kav-brand/home-hero.png',
    alt: 'A study desk combining Torah learning and financial research',
    eyebrow: 'A CENTER FOR HILCHOS RIBBIS',
    title: 'Torah clarity for a complex financial world.',
    description:
      'Kav Haribis brings practical guidance, trusted research, and accessible learning resources to individuals, families, businesses, and communities.',
    primaryCta: {
      text: 'Explore the Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Ask the Bais Horaah →',
      href: '/bais-horaah',
    },
    badge: 'Clarity in Hilchos Ribbis',
    panelDesc:
      'Practical resources for responsible commerce and everyday financial decisions.',
    panelLink: {
      text: 'About Kav Haribis →',
      href: '/about-us',
    },
  },
  {
    id: 2,
    image: '/kav-brand/bank-research.png',
    alt: 'Comprehensive financial research and bank directory analysis',
    eyebrow: 'KOSHER BANKING DIRECTORY',
    title: 'Comprehensive Bank & Lender Research.',
    description:
      'Search hundreds of commercial banks, mortgage lenders, and financial institutions with verified Heter Iska statuses and full research reports.',
    primaryCta: {
      text: 'Search Kosher Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Heter Iska Library →',
      href: '/heter-iska',
    },
    badge: 'Verified Bank Statuses',
    panelDesc:
      'Search listings, review heter iska documents, and access full bank research reports.',
    panelLink: {
      text: 'Open Bank Directory →',
      href: '/bank-directory',
    },
  },
  {
    id: 3,
    image: '/kav-brand/bais-horaah.png',
    alt: 'Rabbinic consultations for Jewish business owners and individuals',
    eyebrow: 'FREE RABBINIC CONSULTATIONS',
    title: 'Expert Rabbinic Guidance for Your Business.',
    description:
      'Submit questions directly to experienced Rabbanim, review partnership agreements, and ensure 100% Ribis compliance in all financial transactions.',
    primaryCta: {
      text: 'Submit a Question to Bais Horaah',
      href: '/bais-horaah',
    },
    secondaryCta: {
      text: 'Listen to Shiurim →',
      href: '/audio',
    },
    badge: 'Personalized Halachic Advice',
    panelDesc:
      'Direct contact with Bais Horaah Rabbanim for prompt, authoritative halachic decisions.',
    panelLink: {
      text: 'Ask a Question →',
      href: '/bais-horaah',
    },
  },
];

export default function BoxPreview({
  cardsPreview = false,
}: {
  cardsPreview?: boolean;
}) {
  const [active, setActive] = useState(0),
    [currentSlide, setCurrentSlide] = useState(0),
    [dragStartX, setDragStartX] = useState<number | null>(null),
    [isDragging, setIsDragging] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % offerings.length),
      1900,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, []);

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
  };

  const handleDragEnd = (clientX: number) => {
    if (dragStartX === null) return;
    const diffX = dragStartX - clientX;
    if (diffX > 40) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    } else if (diffX < -40) {
      setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    }
    setDragStartX(null);
    setIsDragging(false);
  };
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
      {/* Interactive Hero Slider with 3 Slides */}
      <section
        className={`heroSliderContainer ${isDragging ? 'dragging' : ''}`}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseUp={(e) => handleDragEnd(e.clientX)}
        onMouseLeave={(e) => isDragging && handleDragEnd(e.clientX)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`heroSlideItem ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              className="heroSlideBgImage"
              src={slide.image}
              alt={slide.alt}
            />
            <div className="heroSlideOverlay" />
            <div className="heroSlideInner container">
              <div className="homeHeroCopy lg:pl-7">
                <p className="eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <div className="homeHeroActions">
                  <a className="primary" href={slide.primaryCta.href}>
                    {slide.primaryCta.text}
                  </a>
                  <a href={slide.secondaryCta.href}>
                    {slide.secondaryCta.text}
                  </a>
                </div>
                <div className="hidden">
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
              </div>
            </div>
          </div>
        ))}

        {/* Slide Pagination Dots */}
        <div className="heroSliderPagination">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              className={`heroSliderDot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
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
      {/* Clean & Professional OUR MISSION Section */}
      <section className="missionSectionWrapper">
        <div className="container">
          <div className="missionGrid">
            {/* Left Side: Clean Image */}
            <div className="missionVisualContainer">
              <div className="missionImageFrame">
                <img
                  className="missionImage"
                  src="/kav-brand/mission-visual-v2.png"
                  alt="A traditional library passage opening toward a modern financial district"
                />
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="missionContent">
              <span className="missionEyebrow">OUR MISSION</span>
              <h2 className="missionTitle">
                Making Hilchos Ribbis understandable, accessible, and practical.
              </h2>
              <p className="missionDesc">
                Modern financial arrangements can involve mortgages, business financing, investments, payment plans, banking products, and partnerships. Each may require careful Halachic consideration.
              </p>
              <p className="missionDesc">
                Kav Haribis combines Torah education with practical research so that questions can be recognized early and addressed responsibly.
              </p>
              <div className="missionActions">
                <a href="/about-us" className="missionLinkBtn">
                  Learn about the organization →
                </a>
              </div>
            </div>
          </div>
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
      {/* 3 MAIN CATEGORIES KAV HARIBIS OFFERINGS */}
      <section className="cleanOfferingsSection">
        <header className="cleanOfferingsHeader">
          <p className="eyebrow gold">KAV HARIBIS OFFERINGS</p>
          <h2>Everything we offer—alive, clear, and easy to explore.</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-[1440px] mx-auto px-4 sm:px-8">
          {mainOfferingsCategories.map((cat) => (
            <div key={cat.title} className="categoryCard3Col">
              <div className="categoryCardHeader">
                <span className="categoryCardIcon">{cat.icon}</span>
                <div className="categoryCardTitleGroup">
                  <span>{cat.eyebrow}</span>
                  <h3>{cat.title}</h3>
                </div>
              </div>
              <p className="categoryCardDesc">{cat.description}</p>

              <div className="categoryLinksList">
                {cat.links.map((link) => (
                  <a key={link.href} href={link.href} className="categoryLinkItem">
                    <span>{link.name}</span>
                    <span className="arrow">→</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className=" bg-[#e9dfca] ">
      <div className='hidden'>
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
      </div>
      </section>
      <div className='hidden'>
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
        <div className="homeSectionHeading flex items-center justify-between">
          <div className='mb-3'>
            <p className="eyebrow gold">LEARN &amp; GROW</p>
            <h2>Torah resources for every level</h2>
          </div>
          <a className='pb-5' href="/audio">Browse all shiurim →</a>
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
      <FeaturedSeforim />

      {/* 2-Row White Background Auto-Sliding Impact Marquee */}
      <section className="homeImpactStripSection">
        {/* Row 1: Right to Left */}
        <div className="impactMarqueeContainer">
          <div className="impactMarqueeTrack rtl">
            {[...impactRow1, ...impactRow1, ...impactRow1].map((item, idx) => (
              <a href="/programs" className="impactCard" key={`r1-${idx}`}>
                <img src={item.src} alt={item.title} />
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="impactMarqueeContainer">
          <div className="impactMarqueeTrack ltr">
            {[...impactRow2, ...impactRow2, ...impactRow2].map((item, idx) => (
              <a href="/programs" className="impactCard" key={`r2-${idx}`}>
                <img src={item.src} alt={item.title} />
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <LandingFaq />
      <SubscriptionForm />
      <SiteFooter showHeterNotice />
    </main>
  );
}
