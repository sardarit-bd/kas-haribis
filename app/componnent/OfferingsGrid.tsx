const offeringsItems = [
  {
    id: 1,
    title: 'Kosher Banking & Lender Directory',
    category: 'Directories',
    href: '/bank-directory',
    image: '/kav-brand/bank-research.png',
    description:
      'Comprehensive halachic research on hundreds of commercial banks, mortgage lenders, and financial institutions with verified Heter Iska statuses and full Rabbinic reports.',
    cta: 'Explore Bank Directory',
  },
  {
    id: 2,
    title: 'Businesses with a Heter Iska',
    category: 'Directories',
    href: '/businesses-with-a-heter-iska',
    image: '/kav-impact/business-visit.jpg',
    description:
      'Browse verified Jewish-owned businesses, corporations, real estate partnerships, and commercial enterprises operating in full accordance with Hilchos Ribbis.',
    cta: 'Browse Business Directory',
  },
  {
    id: 3,
    title: 'Kosher Loan & Financing Services',
    category: 'Directories',
    href: '/kosher-loan-service',
    image: '/kav-impact/heter-iska-presentation.jpg',
    description:
      'Find appropriate financing platforms, commercial loan providers, and personal credit resources structured under continuous Rabbinical oversight.',
    cta: 'View Kosher Loan Services',
  },
  {
    id: 4,
    title: 'Kosher Investment Opportunities',
    category: 'Directories',
    href: '/kosher-investment-opportunities',
    image: '/kav-brand/investments-hero.png',
    description:
      'Review pre-vetted investment models, real estate syndications, and joint ventures designed to comply with Torah laws on profit sharing and interest.',
    cta: 'Explore Investments',
  },
  {
    id: 5,
    title: 'High-Yield Kosher Savings Accounts',
    category: 'Directories',
    href: '/savings',
    image: '/kav-impact/financial-outreach.jpg',
    description:
      'Compare high-yield savings options, interest-bearing accounts, and money market funds structured to avoid Ribbis concerns.',
    cta: 'Compare Savings Options',
  },
  {
    id: 6,
    title: 'Hilchos Ribbis Educational Center',
    category: 'Learning & Resources',
    href: '/educational-center',
    image: '/kav-impact/student-shiur.jpg',
    description:
      'Access a comprehensive learning portal featuring structured curriculum materials, source sheets, and step-by-step guides for individuals, schools, and yeshivos.',
    cta: 'Visit Educational Center',
  },
  {
    id: 7,
    title: 'Audio Shiurim & Lectures',
    category: 'Learning & Resources',
    href: '/audio',
    image: '/kav-brand/audio-hero.png',
    description:
      'Listen to daily audio Shiurim, audio series, and recorded lectures on Hilchos Ribbis presented by leading Rabbonim and Posekim.',
    cta: 'Listen to Shiurim',
  },
  {
    id: 8,
    title: 'Halachic Articles & Research Publications',
    category: 'Learning & Resources',
    href: '/articles',
    image: '/kav-brand/articles-hero.png',
    description:
      'Read practical Torah guidance, contemporary halachic journal articles, and practical briefs addressing modern business challenges.',
    cta: 'Read Articles & Guides',
  },
  {
    id: 9,
    title: 'Common Questions & Halachic Q&A',
    category: 'Learning & Resources',
    href: '/questions',
    image: '/kav-impact/community-event.jpg',
    description:
      'Browse educational answers to frequently asked questions on late fees, business partnerships, credit card points, mortgages, and everyday loans.',
    cta: 'View Common Questions',
  },
  {
    id: 10,
    title: 'Torah Seforim & Publications Store',
    category: 'Learning & Resources',
    href: '/seforim',
    image: '/kav-brand/seforim-hero.png',
    description:
      'Order authoritative Seforim, practical guidebooks, and gilyonos published by Kav Haribis, including the renowned Bris Pinchos series.',
    cta: 'Browse Seforim Store',
  },
  {
    id: 11,
    title: 'Communal Reading Circle & Chavrusa Network',
    category: 'Learning & Resources',
    href: '/reading-circle',
    image: '/kav-impact/student-shiur.jpg',
    description:
      'Join communal learning initiatives, weekly review cycles, and chavrusas studying practical Hilchos Ribbis in communities around the world.',
    cta: 'Join Reading Circle',
  },
  {
    id: 12,
    title: 'Kav Haribis Supporter Membership',
    category: 'Learning & Resources',
    href: '/membership',
    image: '/kav-brand/rate-certified.png',
    description:
      'Become an official member to receive full database access, exclusive research reports, and directly support Rabbinic research worldwide.',
    cta: 'Become a Member',
  },
  {
    id: 13,
    title: 'Heter Iska Consultation & Custom Documents',
    category: 'Services & Programs',
    href: '/heter-iska',
    image: '/kav-brand/heter-iska.png',
    description:
      'Obtain custom Heter Iska legal frameworks, agreement reviews, and tailored advice for business partnerships, loans, and commercial ventures.',
    cta: 'Get Heter Iska Guidance',
  },
  {
    id: 14,
    title: 'Bais Horaah Rabbinic Consultations',
    category: 'Services & Programs',
    href: '/bais-horaah',
    image: '/kav-brand/bais-horaah.png',
    description:
      'Submit confidential halachic queries directly to experienced Dayanim and Rabbanim for definitive rulings on Ribbis matters.',
    cta: 'Consult Bais Horaah',
  },
  {
    id: 15,
    title: 'Genealogy & Historical Rabbinic Services',
    category: 'Services & Programs',
    href: '/genealogy-services',
    image: '/genealogy-hero.png',
    description:
      'Trace Rabbinic lineage, verify traditional family heritage, and access historical Rabbinical records through specialized research services.',
    cta: 'Explore Genealogy Services',
  },
  {
    id: 16,
    title: 'Community Programs & Kehilla Outreach',
    category: 'Services & Programs',
    href: '/programs',
    image: '/kav-impact/recognition-event.jpg',
    description:
      'Request customized educational seminars, Rabbinical conferences, and community awareness programs for your shul, yeshiva, or organization.',
    cta: 'Request Community Program',
  },
  {
    id: 17,
    title: 'Kosher Investment & Venture Certification',
    category: 'Services & Programs',
    href: '/kosher-investment-certification',
    image: '/kav-impact/heter-iska-presentation-2.jpg',
    description:
      'Receive Rabbinical audit and certification for financial funds, private equity, real estate ventures, and commercial investment vehicles.',
    cta: 'Apply for Certification',
  },
  {
    id: 18,
    title: 'Ribbis Halachic Warning & Alert System',
    category: 'Services & Programs',
    href: '/ribis-alerts',
    image: '/kav-brand/mission-visual-v2.png',
    description:
      'Subscribe to urgent Rabbinic warnings, commercial bank policy changes, and financial product alerts to ensure ongoing Halachic compliance.',
    cta: 'Subscribe to Ribbis Alerts',
  },
];

export default function OfferingsGrid() {
  return (
    <section className="bg-white py-20 px-4 sm:px-8 overflow-hidden">
     
      {/* 18 Alternating Rows Layout (Matching Reference Design) */}
      <div className="max-w-[1140px] mx-auto space-y-16 sm:space-y-24">
        {offeringsItems.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={item.id}
              className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image Container */}
              <div className="w-full lg:w-1/2 overflow-hidden shadow-lg border border-slate-200/80 group relative bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[260px] sm:h-[340px] lg:h-[380px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
              </div>

              {/* Content Container */}
              <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#102a43] tracking-tight leading-tight mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal mb-6">
                  {item.description}
                </p>
                <a
                  href={item.href}
                  className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-[#102a43] hover:bg-[#173f5f] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="text-white">{item.cta}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
