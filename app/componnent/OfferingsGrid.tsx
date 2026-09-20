const offeringsItems = [
  {
    id: 1,
    title: 'Kosher Banking & Lender Directory',
    category: 'Directories',
    href: '/bank-directory',
    image: '/934.jpg',
    description: [
      'Comprehensive halachic research on hundreds of commercial banks and mortgage lenders.',
      'Verified Heter Iska statuses with full Rabbinic reports and documentation.',
    ],
    subhead: 'Areas Covered',
    subheaditem: [
      'Commercial Banks',
      'Mortgage Lenders',
      'Heter Iska Ratings',
      'Full Halachic Reports',
    ],
    cta: 'Explore Bank Directory',
  },
  {
    id: 2,
    title: 'Businesses with a Heter Iska',
    category: 'Directories',
    href: '/businesses-with-a-heter-iska',
    image: '/kav-impact/heter-iska-presentation.jpg',
    description: [
      'Browse verified Jewish-owned businesses, corporations, and real estate partnerships.',
      'Operating in full accordance with Hilchos Ribbis and Rabbinical oversight.',
    ],
    subhead: 'Key Highlights',
    subheaditem: [
      'Verified Corporations',
      'Real Estate Partnerships',
      'Commercial Enterprises',
      'Halachic Oversight',
    ],
    cta: 'Browse Business Directory',
  },
  {
    id: 3,
    title: 'Kosher Loan & Financing Services',
    category: 'Directories',
    href: '/kosher-loan-service',
    image: '/2147916483-768x768.webp',
    description: [
      'Find appropriate financing platforms, commercial loan providers, and credit resources.',
      'Structured under continuous Rabbinical oversight and legal Halachic frameworks.',
    ],
    subhead: 'Services Included',
    subheaditem: [
      'Financing Platforms',
      'Commercial Loans',
      'Personal Credit Resources',
      'Rabbinical Review',
    ],
    cta: 'View Kosher Loan Services',
  },
  {
    id: 4,
    title: 'Kosher Investment Opportunities',
    category: 'Directories',
    href: '/kosher-investment-opportunities',
    image: '/2148803904.jpg',
    description: [
      'Review pre-vetted investment models, real estate syndications, and joint ventures.',
      'Designed to comply with Torah laws on profit sharing and interest.',
    ],
    subhead: 'Investment Types',
    subheaditem: [
      'Pre-vetted Models',
      'Real Estate Syndications',
      'Joint Ventures',
      'Torah Profit Sharing',
    ],
    cta: 'Explore Investments',
  },
  {
    id: 5,
    title: 'High-Yield Kosher Savings Accounts',
    category: 'Directories',
    href: '/savings',
    image: '/2148317885.jpg',
    description: [
      'Compare high-yield savings options, interest-bearing accounts, and money market funds.',
      'Structured to avoid Ribbis concerns with complete transparency.',
    ],
    subhead: 'Account Features',
    subheaditem: [
      'High-Yield Savings',
      'Interest-Bearing Accounts',
      'Money Market Funds',
      'Ribbis Compliance',
    ],
    cta: 'Compare Savings Options',
  },
  {
    id: 6,
    title: 'Hilchos Ribbis Educational Center',
    category: 'Learning & Resources',
    href: '/educational-center',
    image: '/kav-impact/student-shiur.jpg',
    description: [
      'Access a comprehensive learning portal featuring structured curriculum materials.',
      'Includes source sheets and step-by-step guides for individuals, schools, and yeshivos.',
    ],
    subhead: 'Learning Resources',
    subheaditem: [
      'Curriculum Materials',
      'Source Sheets',
      'Yeshiva Guides',
      'Step-by-Step Portals',
    ],
    cta: 'Visit Educational Center',
  },
  {
    id: 7,
    title: 'Audio Shiurim & Lectures',
    category: 'Learning & Resources',
    href: '/audio',
    image: '/kav-brand/audio-hero.png',
    description: [
      'Listen to daily audio Shiurim, audio series, and recorded lectures on Hilchos Ribbis.',
      'Presented by leading Rabbonim and Posekim with practical insights.',
    ],
    subhead: 'Topics & Formats',
    subheaditem: [
      'Daily Audio Shiurim',
      'Rabbinic Lecture Series',
      'Contemporary Insights',
      'Posekim Q&A',
    ],
    cta: 'Listen to Shiurim',
  },
  {
    id: 8,
    title: 'Halachic Articles & Research Publications',
    category: 'Learning & Resources',
    href: '/articles',
    image: '/stylish-mature-male-reading-newspaper-2048x2048.jpg',
    description: [
      'Read practical Torah guidance and contemporary halachic journal articles.',
      'Practical briefs addressing modern business and commercial challenges.',
    ],
    subhead: 'Publication Areas',
    subheaditem: [
      'Practical Torah Guidance',
      'Journal Articles',
      'Business Briefs',
      'Halachic Analysis',
    ],
    cta: 'Read Articles & Guides',
  },
  {
    id: 9,
    title: 'Common Questions & Halachic Q&A',
    category: 'Learning & Resources',
    href: '/questions',
    image: '/kav-impact/community-event.jpg',
    description: [
      'Browse educational answers to frequently asked questions on late fees and business partnerships.',
      'Guidance on credit card points, mortgages, and everyday loan scenarios.',
    ],
    subhead: 'Topics Addressed',
    subheaditem: [
      'Late Fees & Penalties',
      'Credit Card Points',
      'Mortgages & Refinancing',
      'Everyday Loans',
    ],
    cta: 'View Common Questions',
  },
  {
    id: 10,
    title: 'Torah Seforim & Publications Store',
    category: 'Learning & Resources',
    href: '/seforim',
    image: '/hands-woman-black-clothes-holding-opened-book-2048x2048.jpg',
    description: [
      'Order authoritative Seforim, practical guidebooks, and gilyonos published by Kav Haribis.',
      'Includes the renowned Bris Pinchos series and halachic reference works.',
    ],
    subhead: 'Featured Collections',
    subheaditem: [
      'Bris Pinchos Series',
      'Practical Guidebooks',
      'Torah Gilyonos',
      'Halachic Reference Works',
    ],
    cta: 'Browse Seforim Store',
  },
  {
    id: 12,
    title: 'Kav Haribis Supporter Membership',
    category: 'Learning & Resources',
    href: '/membership',
    image: '/Membership.jpg',
    description: [
      'Become an official member to receive full database access and exclusive research reports.',
      'Directly support Rabbinic research and halachic clarification worldwide.',
    ],
    subhead: 'Member Benefits',
    subheaditem: [
      'Full Database Access',
      'Exclusive Research Reports',
      'Direct Rabbinic Support',
      'Halachic Updates',
    ],
    cta: 'Become a Member',
  },
  {
    id: 13,
    title: 'Heter Iska Consultation & Custom Documents',
    category: 'Services & Programs',
    href: '/heter-iska',
    image: '/kav-brand/heter-iska.png',
    description: [
      'Obtain custom Heter Iska legal frameworks and agreement reviews.',
      'Tailored advice for business partnerships, commercial loans, and corporate ventures.',
    ],
    subhead: 'Areas Covered',
    subheaditem: [
      'Contracts & Agreements',
      'Partnership Structures',
      'Custom Frameworks',
      'Commercial Ventures',
    ],
    cta: 'Get Heter Iska Guidance',
  },
  {
    id: 14,
    title: 'Bais Horaah Rabbinic Consultations',
    category: 'Services & Programs',
    href: '/bais-horaah',
    image: '/rabi-consaltant.jpg',
    description: [
      'Submit confidential halachic queries directly to experienced Dayanim and Rabbanim.',
      'Receive definitive rulings and guidance on complex Ribbis matters.',
    ],
    subhead: 'Rulings & Guidance',
    subheaditem: [
      'Confidential Queries',
      'Dayanim Rulings',
      'Ribbis Guidance',
      'Direct Consultation',
    ],
    cta: 'Consult Bais Horaah',
  },
  {
    id: 15,
    title: 'Genealogy & Historical Rabbinic Services',
    category: 'Services & Programs',
    href: '/genealogy-services',
    image: '/genealogy-hero.png',
    description: [
      'Trace Rabbinic lineage and verify traditional family heritage.',
      'Access historical Rabbinical records through specialized research services.',
    ],
    subhead: 'Research Services',
    subheaditem: [
      'Rabbinic Lineage',
      'Family Heritage Verification',
      'Historical Records',
      'Archives Search',
    ],
    cta: 'Explore Genealogy Services',
  },
  {
    id: 16,
    title: 'Community Programs & Kehilla Outreach',
    category: 'Services & Programs',
    href: '/programs',
    image: '/kav-impact/community-event.jpg',
    description: [
      'Request customized educational seminars and Rabbinical conferences.',
      'Organize community awareness programs for your shul, yeshiva, or organization.',
    ],
    subhead: 'Event Offerings',
    subheaditem: [
      'Educational Seminars',
      'Rabbinical Conferences',
      'Community Awareness',
      'Shul & Yeshiva Workshops',
    ],
    cta: 'Request Community Program',
  },
  {
    id: 17,
    title: 'Kosher Investment & Venture Certification',
    category: 'Services & Programs',
    href: '/kosher-investment-certification',
    image: '/kav-brand/rate-certified.png',
    description: [
      'Receive Rabbinical audit and certification for financial funds and private equity.',
      'Clearance for real estate ventures and commercial investment vehicles.',
    ],
    subhead: 'Certification Scope',
    subheaditem: [
      'Financial Funds Audit',
      'Private Equity Review',
      'Real Estate Ventures',
      'Commercial Clearance',
    ],
    cta: 'Apply for Certification',
  },
  {
    id: 18,
    title: 'Ribbis Halachic Warning & Alert System',
    category: 'Services & Programs',
    href: '/ribis-alerts',
    image: '/2151546403.webp',
    description: [
      'Subscribe to urgent Rabbinic warnings and commercial bank policy changes.',
      'Receive financial product alerts to ensure ongoing Halachic compliance.',
    ],
    subhead: 'Alert Coverage',
    subheaditem: [
      'Urgent Rabbinic Warnings',
      'Bank Policy Changes',
      'Financial Product Alerts',
      'Compliance Updates',
    ],
    cta: 'Subscribe to Ribbis Alerts',
  },
];

export default function OfferingsGrid() {
  return (
    <section className="bg-[#f8f5ef]/40 py-20 overflow-hidden">
      {/* Programs Style Layout (Inspired by ribis.netlify.app/programs) */}
      <div className="container mx-auto space-y-20 sm:space-y-28 px-4 lg:px-8">
        {offeringsItems.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={item.id}
              className={`grid grid-cols-1 lg:grid-cols-2 items-center gap-12 sm:gap-16 ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image Container (ribis.netlify.app/programs style) */}
              <div
                className={`relative ${
                  isEven ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
                }`}
              >
                <div className="absolute -left-6 -top-6 h-36 w-36 rounded-full bg-[#c8a21a]/15 blur-3xl" />
                <div className="overflow-hidden border border-[#eadfcb] bg-white p-3.5 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[300px] sm:h-[380px] lg:h-[500px] w-full object-cover transition-transform duration-700 ease-out"
                  />
                </div>
              </div>

              {/* Content Container (ribis.netlify.app/programs style) */}
              <div
                className={`flex flex-col items-start ${
                  isEven ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
                }`}
              >
                {/* {item.category && (
                  <div className="mb-4 inline-flex items-center rounded-full border border-[#eadfcb] bg-white px-4 py-1.5 text-xs font-semibold text-[#9b7b16] shadow-sm">
                    {item.category}
                  </div>
                )} */}

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#051933] leading-tight tracking-tight mb-5">
                  {item.title}
                </h2>

                {Array.isArray(item.description) ? (
                  <div className="space-y-3 mb-6">
                    {item.description.map((desc, i) => (
                      <p
                        key={i}
                        className="text-base sm:text-lg leading-relaxed text-[#5f6b7a]"
                      >
                        {desc}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base sm:text-lg leading-relaxed text-[#5f6b7a] mb-6">
                    {item.description}
                  </p>
                )}

                {/* Subhead Grid Cards Box (Programs style) */}
                {item.subhead && item.subheaditem && item.subheaditem.length > 0 && (
                  <div className="w-full mb-8 border border-[#eadfcb] bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-[#051933] uppercase tracking-wider mb-4">
                      {item.subhead}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {item.subheaditem.map((tag, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-[#ece3d5] bg-white p-3.5 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c8a21a]/50 hover:shadow-md"
                        >
                          <div className="h-2.5 w-2.5 rounded-full bg-[#c8a21a] shrink-0" />
                          <span className="text-sm font-semibold text-[#051933]">
                            {tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  style={{color:"white"}}
                  href={item.href}
                  className="inline-flex items-center gap-3 px-6 py-3.5 pBG text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-[#c8a21a]/30"
                >
                  <span>{item.cta}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
