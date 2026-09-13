import NavigationMenu from './navigation-menu';
import SponsorBanner from './sponsor-banner';

export function SiteHeader() {
  return (
    <>
      <SponsorBanner/>
      <div className="bg-[#102a43] text-[#e3c176] py-1.5 text-xs font-medium border-b border-[#e3c176]/30 tracking-wide hidden">
        <div className="container px-4 sm:px-8 flex items-center justify-between ">
          <span>בס״ד</span>
          <span className="hidden sm:inline">Promoting awareness and observance of Hilchos Ribbis</span>
          <a href="/contact" className="hover:text-white transition-colors">Contact Kav Haribis</a>
        </div>
      </div>
      <header className="h-[80px] md:h-[92px] w-full flex items-center justify-between bg-white sticky top-0 z-50 shadow-[0_4px_24px_#12263a12]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between relative w-full">
          <a className="flex items-center gap-3 shrink-0" href="/">
            <img src={'/logos/logo.png'} alt="logo" className='w-[200px] md:w-[220px] h-auto object-contain' />
          </a>
          <NavigationMenu />
        </div>
      </header>
    </>
  );
}

export function SiteFooter({
  showHeterNotice = false,
}: {
  showHeterNotice?: boolean;
}) {
  return (
    <footer className="bg-white text-[#172431] pt-20 pb-[35px] relative block">
      <div className="container px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_repeat(4,1fr)] gap-[36px] mb-[45px]">
          <div className="flex flex-col gap-[14px]">
            <div className="inline-block w-fit">
              <img src={'/logos/logo.png'} alt="Kav Haribis Logo" className="w-[240px] sm:w-[260px] h-auto block" />
            </div>
            <p className="font-bold text-[#102a43] text-[15px] tracking-tight mt-1 hidden">Torah guidance for responsible commerce.</p>
            <p className="text-lg font-meduim text-gray-600  max-w-[320px]">
              Promoting awareness and observance of Hilchos Ribbis in modern business and everyday financial transactions.
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 text-[20px] font-meduim capitalize mb-[18px] flex items-center gap-2">Directories</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] text-gray-700">
              <li>
                <a href="/bank-directory" className="hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Kosher Banks
                </a>
              </li>
              <li>
                <a href="/businesses-with-a-heter-iska" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Businesses with Heter Iska
                </a>
              </li>
              <li>
                <a href="/kosher-loan-service" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Kosher Loan Services
                </a>
              </li>
              <li>
                <a href="/kosher-investment-opportunities" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Investment Opportunities
                </a>
              </li>
              <li>
                <a href="/savings" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Kosher Savings
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-800 text-[20px] font-meduim capitalize mb-[18px] flex items-center gap-2">Learning &amp; Resources</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] text-gray-700">
              <li>
                <a href="/educational-center" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Educational Center
                </a>
              </li>
              <li>
                <a href="/audio" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Audio &amp; Shiurim
                </a>
              </li>
              <li>
                <a href="/articles" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Articles &amp; Guides
                </a>
              </li>
              <li>
                <a href="/questions" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Common Questions
                </a>
              </li>
              <li>
                <a href="/seforim" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Seforim Store
                </a>
              </li>
              <li>
                <a href="/reading-circle" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Reading Circle
                </a>
              </li>
              <li>
                <a href="/membership" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Kav Haribis Membership
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-800 text-[20px] font-meduim capitalize mb-[18px] flex items-center gap-2">Services &amp; Programs</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] text-gray-700">
              <li>
                <a href="/heter-iska" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Heter Iska Advisory
                </a>
              </li>
              <li>
                <a href="/bais-horaah" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Bais Horaah
                </a>
              </li>
              <li>
                <a href="/genealogy-services" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Genealogy Services
                </a>
              </li>
              <li>
                <a href="/programs" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Community Programs
                </a>
              </li>
              <li>
                <a href="/kosher-investment-certification" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Investment Certification
                </a>
              </li>
              <li>
                <a href="/ribis-alerts" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Ribbis Alerts
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-800 text-[20px] font-meduim capitalize mb-[18px] flex items-center gap-2">Quick Links</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] text-gray-700">
              <li>
                <a href="/" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Home Page
                </a>
              </li>
              <li>
                <a href="/about-us" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  About Kav Haribis
                </a>
              </li>
              <li>
                <a href="/contact" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/donate" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Donate &amp; Support
                </a>
              </li>
              <li>
                <a href="/sign-in" className="text-[#475569] hover:text-[#102a43] text-base transition-all hover:translate-x-1 inline-flex items-center gap-1.5">
                  Member Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-[25px] border-t border-gray-200/70 flex flex-col sm:flex-row items-center justify-center text-base text-gray-700 gap-4">
          <p>© {new Date().getFullYear()} Kav Haribis — קו הריבית. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function InteriorPage({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <main className="bg-slate-50/50">
      <section className="bg-[#102a43] text-white py-12 md:py-16 text-center">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 max-w-4xl">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-2 hidden">{eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-white mb-3">{title}</h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">{intro}</p>
        </div>
      </section>
    </main>
  );
}