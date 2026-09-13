const offeringsGridItems = [
  {
    title: 'Kosher Bank Directory',
    subtitle: 'Research banks and lenders',
    href: '/bank-directory',
    icon: (
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="20" />
        <path d="M27 22L42 32L27 42V22Z" fill="#c69b46" />
      </svg>
    ),
  },
  {
    title: 'Articles & Gilyonos',
    subtitle: 'Read practical Torah guidance',
    href: '/articles',
    icon: (
      <svg className="w-10 h-10 text-[#c69b46]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="12" width="36" height="42" rx="3" />
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="36" x2="36" y2="36" />
        <line x1="20" y1="44" x2="32" y2="44" />
      </svg>
    ),
  },
];

export default function OfferingsGrid() {
  return (
    <section className="bg-[#102a43] py-20 px-4 sm:px-8">
      <header className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-3 hidden">
          KAV HARIBIS OFFERINGS
        </p>
        <h2 className="text-white text-3xl sm:text-5xl font-meduim leading-tight">
          Everything we offer—alive, clear, and easy to explore.
        </h2>
      </header>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7">
          {offeringsGridItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="bg-white p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[165px] group border border-white/10"
            >
              <div className="mb-3 transition-transform duration-300 group-hover:scale-105">
                {item.icon}
              </div>
              <h3 className="font-meduim text-[#1e293b] text-base sm:text-xl leading-snug">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-[#64748b] text-xs sm:text-base mt-1 font-medium">
                  {item.subtitle}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
