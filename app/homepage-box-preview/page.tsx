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

const impactGalleryItems = [
  {
    title: 'Student Education',
    subtitle: 'Torah Lectures & Kehilla Seminars',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Shiurim & Classes',
    link: '/programs',
  },
  {
    title: 'Business Outreach',
    subtitle: 'Halachic Guidance for Modern Enterprise',
    src: '/kav-impact/heter-iska-presentation.jpg',
    category: 'Commercial Advisory',
    link: '/programs',
  },
  {
    title: 'Financial Education',
    subtitle: 'Responsible Commerce & Observance',
    src: '/kav-impact/financial-outreach.jpg',
    category: 'Education',
    link: '/programs',
  },
  {
    title: 'Community Outreach',
    subtitle: 'Raising Awareness on Hilchos Ribbis',
    src: '/kav-impact/community-event.jpg',
    category: 'Community',
    link: '/programs',
  },
  {
    title: 'Commercial Advisory',
    subtitle: 'Structuring Kosher Financial Contracts',
    src: '/kav-impact/business-visit.jpg',
    category: 'Heter Iska',
    link: '/programs',
  },
  {
    title: 'Rabbinic Recognition',
    subtitle: 'Bais Horaah Endorsements & Conferences',
    src: '/kav-impact/recognition-event.jpg',
    category: 'Rabbinical Advisory',
    link: '/programs',
  },
  {
    title: 'Heter Iska Advisory',
    subtitle: 'Custom Agreements & Legal Frameworks',
    src: '/kav-impact/heter-iska-presentation-2.jpg',
    category: 'Legal & Halacha',
    link: '/programs',
  },
  {
    title: 'Educational Shiurim',
    subtitle: 'Practical Guidance for Daily Life',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Learning',
    link: '/programs',
  },
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

const offeringsGridItems = [
  {
    title: 'Kosher Bank Directory',
    subtitle: 'Research banks and lenders',
    href: '/bank-directory',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 26L32 14L52 26" />
        <path d="M8 26H56V30H8V26Z" />
        <circle cx="32" cy="22" r="2.5" />
        <path d="M16 30V46" />
        <path d="M26.6 30V46" />
        <path d="M37.3 30V46" />
        <path d="M48 30V46" />
        <path d="M10 46H54V50H10V46Z" />
      </svg>
    ),
  },
  {
    title: 'Businesses with a Heter Iska',
    subtitle: 'Browse verified business directory',
    href: '/businesses-with-a-heter-iska',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 26L18 16H46L50 26" />
        <path d="M12 26H52V48C52 49.1 51.1 50 50 50H14C12.9 50 12 49.1 12 48V26Z" />
        <path d="M24 34H40V50H24V34Z" />
        <circle cx="44" cy="20" r="5" fill="white" />
        <path d="M42 20L43.5 21.5L46 19" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Kosher Loan Services',
    subtitle: 'Find appropriate financing resources',
    href: '/kosher-loan-service',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 42C12 42 18 40 22 40C26 40 30 44 36 44C42 44 46 41 50 41" />
        <path d="M12 42V52H52V47" />
        <path d="M24 24C24 20 27 18 30 18C33 18 36 20 36 24C38 25 40 28 39 34C38 38 34 40 30 40C26 40 22 38 21 34C20 28 22 25 24 24Z" fill="white" />
        <path d="M27 22H33" />
        <path d="M30 27V35M28.5 29.5C28.5 29.5 29.3 28.5 30 28.5C30.7 28.5 31.5 29.5 31.5 30.5C31.5 32 28.5 32 28.5 33.5C28.5 34.5 29.3 35.5 30 35.5C30.7 35.5 31.5 34.5 31.5 34.5" />
      </svg>
    ),
  },
  {
    title: 'Investment Opportunities',
    subtitle: 'Review kosher investment models',
    href: '/kosher-investment-opportunities',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 50V18C12 16.8954 12.8954 16 14 16H32C33.1046 16 34 16.8954 34 18V50" />
        <rect x="17" y="22" width="4" height="4" rx="0.5" />
        <rect x="25" y="22" width="4" height="4" rx="0.5" />
        <rect x="17" y="30" width="4" height="4" rx="0.5" />
        <rect x="25" y="30" width="4" height="4" rx="0.5" />
        <circle cx="44" cy="38" r="9" fill="white" />
        <path d="M44 33V43M42 36C42 36 43 35 44 35C45 35 46 36 46 37C46 38.5 42 38.5 42 40C42 41 43 42 44 42C45 42 46 41 46 41" />
        <line x1="8" y1="50" x2="56" y2="50" />
      </svg>
    ),
  },
  {
    title: 'High-Yield Savings',
    subtitle: 'Compare savings-account information',
    href: '/savings',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="18" width="40" height="32" rx="4" />
        <circle cx="32" cy="34" r="8" />
        <path d="M32 26V42M24 34H40" />
        <circle cx="44" cy="24" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Heter Iska Library',
    subtitle: 'Preview and obtain documents',
    href: '/heter-iska',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 14H40L50 24V50C50 51.1 49.1 52 48 52H16C14.9 52 14 51.1 14 50V16C14 14.9 14.9 14 16 14Z" />
        <path d="M38 14V26H50" />
        <path d="M22 34H42M22 40H38M22 46H32" />
      </svg>
    ),
  },
  {
    title: 'Bais Horaah Consultation',
    subtitle: 'Submit a Ribbis question',
    href: '/bais-horaah',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 12V48M16 22H48M16 22L10 36H22L16 22ZM48 22L42 36H54L48 22Z" />
        <path d="M22 48H42" />
      </svg>
    ),
  },
  {
    title: 'Audio & Video Shiurim',
    subtitle: 'Listen and learn anytime',
    href: '/audio',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="20" />
        <path d="M27 22L42 32L27 42V22Z" fill="#b87b5c" />
      </svg>
    ),
  },
  {
    title: 'Articles & Gilyonos',
    subtitle: 'Read practical Torah guidance',
    href: '/articles',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="12" width="36" height="42" rx="3" />
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="36" x2="36" y2="36" />
        <line x1="20" y1="44" x2="32" y2="44" />
      </svg>
    ),
  },
  {
    title: 'Halacha Guidance',
    subtitle: 'Explore practical Hilchos Ribbis',
    href: '/halacha',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 18C12 18 20 14 32 18C44 14 52 18 52 18V48C52 48 44 44 32 48C20 44 12 48 12 48V18Z" />
        <line x1="32" y1="18" x2="32" y2="48" />
      </svg>
    ),
  },
  {
    title: 'Seforim Store',
    subtitle: 'Browse Kav Haribis publications',
    href: '/seforim',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 20H46V46H14V20Z" />
        <path d="M14 20L20 14H50V40L46 46" />
        <line x1="20" y1="20" x2="20" y2="46" />
      </svg>
    ),
  },
  {
    title: 'Investment Certification',
    subtitle: 'Request a structured review',
    href: '/kosher-investment-certification',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 12L48 18V32C48 42 38 48 32 52C26 48 16 42 16 32V18L32 12Z" />
        <path d="M26 31L30 35L38 25" />
      </svg>
    ),
  },
  {
    title: 'Community Programs',
    subtitle: 'Education and community outreach',
    href: '/programs',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="24" r="6" />
        <path d="M20 44C20 37.4 25.4 32 32 32C38.6 32 44 37.4 44 44" />
        <circle cx="18" cy="28" r="4" />
        <path d="M10 44C10 39.5 13.6 36 18 36" />
        <circle cx="46" cy="28" r="4" />
        <path d="M54 44C54 39.5 50.4 36 46 36" />
      </svg>
    ),
  },
  {
    title: 'Genealogy Services',
    subtitle: 'Research potential ownership concerns',
    href: '/genealogy-services',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="28" r="14" />
        <path d="M38 38L50 50" strokeWidth="3" />
        <path d="M24 28H32M28 24V32" />
      </svg>
    ),
  },
  {
    title: 'Kav Haribis Membership',
    subtitle: 'Join free and manage preferences',
    href: '/membership',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="16" width="40" height="32" rx="4" />
        <circle cx="26" cy="30" r="5" />
        <path d="M18 42C18 38 21.6 35 26 35C30.4 35 34 38 34 42" />
        <line x1="38" y1="26" x2="46" y2="26" />
        <line x1="38" y1="32" x2="44" y2="32" />
      </svg>
    ),
  },
  {
    title: 'Ribbis Alerts',
    subtitle: 'View important community updates',
    href: '/ribis-alerts',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 14C23.2 14 18 21 18 30V38L14 44H50L46 38V30C46 21 40.8 14 32 14Z" />
        <path d="M27 48C27 50.8 29.2 53 32 53C34.8 53 37 50.8 37 48" />
      </svg>
    ),
  },
  {
    title: 'Support & Donate',
    subtitle: 'Support the Kav Haribis mission',
    href: '/donate',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 48C32 48 14 36 14 24C14 18.5 18.5 14 24 14C27.5 14 30.5 15.8 32 18.5C33.5 15.8 36.5 14 40 14C45.5 14 50 18.5 50 24C50 36 32 48 32 48Z" fill="#b87b5c" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    title: 'Educational Center',
    subtitle: 'Coloring pages, pamphlets & school resources',
    href: '/educational-center',
    icon: (
      <svg className="w-12 h-12 text-[#b87b5c]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 24L32 14L52 24L32 34L12 24Z" />
        <path d="M20 28V42C20 42 26 46 32 46C38 46 44 42 44 42V28" />
        <path d="M48 26V40" />
      </svg>
    ),
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
              <div className="homeHeroCopy">
                <p className="eyebrow hidden">{slide.eyebrow}</p>
                <h1 className=''>{slide.title}</h1>
                <p className='pt-8'>{slide.description}</p>
                <div className="homeHeroActions">
                  <a className="primary" href={slide.primaryCta.href}>
                    {slide.primaryCta.text}
                  </a>
                  <a className='hidden'  href={slide.secondaryCta.href}>
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
      {/* KAV HARIBIS OFFERINGS SECTION */}
      <section className="cleanOfferingsSection bg-[#042d22] py-20 px-4 sm:px-8">
        <header className="cleanOfferingsHeader text-center max-w-4xl mx-auto mb-14">
          <p className="eyebrow gold text-[#e5c474] font-bold text-xs tracking-widest uppercase mb-3">
            KAV HARIBIS OFFERINGS
          </p>
          <h2 className="text-white font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-tight">
            Everything we offer—alive, clear, and easy to explore.
          </h2>
        </header>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-8"> 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7">
            {offeringsGridItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="bg-white rounded-[20px] p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[165px] group border border-white/10"
              >
                <div className="mb-3 transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#1e293b] text-base sm:text-lg leading-snug">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-[#64748b] text-xs sm:text-sm mt-1 font-medium">
                    {item.subtitle}
                  </p>
                )}
              </a>
            ))}
          </div>
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

      {/* Community Impact Grid Gallery Section */}
      <section className="homeImpactGridSection">
        <div className="container">
          <div className="impactGridHeader">
            <p className="eyebrow gold mb-2">KAV HARIBIS IN ACTION</p>
            <h2 className="text-center text-black text-4xl py-2 font-bold">Community Impact &amp; Gallery</h2>
            <p className="sectionSubtitle max-w-2xl mx-auto text-slate-600 mt-2">
              Promoting Hilchos Ribbis education, commercial advisory, and rabbinical guidance across kehillos and businesses worldwide.
            </p>
          </div>

          <div className="impactGalleryGrid">
            {impactGalleryItems.map((item, idx) => (
              <a href={item.link} className="impactGalleryCard group" key={idx}>
                <div className="galleryImgWrapper">
                  <img src={item.src} alt={item.title} className="galleryImg" />
                  <span className="galleryBadge hidden">{item.category}</span>
                </div>
                <div className="galleryCardContent">
                  <h3 className="galleryCardTitle">{item.title}</h3>
                  <p className="galleryCardSubtitle">{item.subtitle}</p>
                  <span className="galleryCardAction">
                    Explore program <span className="arrow">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="impactGridFooter">
            <a href="/contact" className="impactCtaBtn">
              <span>Request a Program</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <LandingFaq />
      <SubscriptionForm />
      <SiteFooter showHeterNotice />
    </main>
  );
}
