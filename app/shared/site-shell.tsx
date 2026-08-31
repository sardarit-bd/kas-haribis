
import type { ReactNode } from 'react';
import NavigationMenu from './navigation-menu';

export function SiteHeader() {
  return (
    <>
      <div className="topline">
        <span>בס״ד</span>
        <span>Promoting awareness and observance of Hilchos Ribbis</span>
        <a href="/contact">Contact Kav Haribis</a>
      </div>
      <header className="siteHeader migrationHeader">
        <a className="brand" href="/">
          <img src={'../../public/logo.png'} alt="logo" className='w-[220px] h-auto' />
        </a>
        <NavigationMenu />
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
    <footer className="siteFooterBig">
      <div className="footerMainGrid">
        <div className="footerBrandCol">
          <div className="brand light mb-3">
               <img src={'../../public/logo.png'} alt="logo" className='w-[300px] h-auto bg-white p-3' />
          </div>
          <p className="footerTagline">Torah guidance for responsible commerce.</p>
          <p className="footerDesc">
            Promoting awareness and observance of Hilchos Ribbis in modern business and everyday financial transactions.
          </p>
          <div className="footerActions">
            <a href="/donate" className="footerDonateBtn">
              Donate &amp; Support
            </a>
            <a href="/contact" className="footerContactBtn">
              Contact Bais Horaah
            </a>
          </div>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Directories</h4>
          <ul className="footerNavList">
            <li>
              <a href="/bank-directory">Kosher Banks</a>
            </li>
            <li>
              <a href="/businesses-with-a-heter-iska">Businesses with Heter Iska</a>
            </li>
            <li>
              <a href="/kosher-loan-service">Kosher Loan Services</a>
            </li>
            <li>
              <a href="/kosher-investment-opportunities">Investment Opportunities</a>
            </li>
            <li>
              <a href="/savings">Kosher Savings</a>
            </li>
          </ul>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Learning &amp; Resources</h4>
          <ul className="footerNavList">
            <li>
              <a href="/educational-center">Educational Center</a>
            </li>
            <li>
              <a href="/audio">Audio &amp; Shiurim</a>
            </li>
            <li>
              <a href="/articles">Articles &amp; Guides</a>
            </li>
            <li>
              <a href="/questions">Common Questions</a>
            </li>
            <li>
              <a href="/seforim">Seforim Store</a>
            </li>
            <li>
              <a href="/reading-circle">Reading Circle</a>
            </li>
            <li>
              <a href="/membership">Kav Haribis Membership</a>
            </li>
          </ul>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Services &amp; Programs</h4>
          <ul className="footerNavList">
            <li>
              <a href="/heter-iska">Heter Iska Advisory</a>
            </li>
            <li>
              <a href="/bais-horaah">Bais Horaah</a>
            </li>
            <li>
              <a href="/genealogy-services">Genealogy Services</a>
            </li>
            <li>
              <a href="/programs">Community Programs</a>
            </li>
            <li>
              <a href="/kosher-investment-certification">Investment Certification</a>
            </li>
            <li>
              <a href="/ribis-alerts">Ribbis Alerts</a>
            </li>
          </ul>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Quick Links</h4>
          <ul className="footerNavList">
            <li>
              <a href="/">Home Page</a>
            </li>
            <li>
              <a href="/about-us">About Kav Haribis</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
            <li>
              <a href="/donate">Donate &amp; Support</a>
            </li>
            <li>
              <a href="/sign-in">Member Sign In</a>
            </li>
          </ul>
        </div>
      </div>

      {showHeterNotice && (
        <div className="footerHeterNoticeCard">
          <p className="footerHeterNotice">
            <strong>
              All transactions, sales, and credit extensions executed by{' '}
              <a
                href="https://kavharibis.com/heter-iska/"
                target="_blank"
                rel="noreferrer"
              >
                Kav Haribis
              </a>
            </strong>{' '}
            that potentially violate the halachic prohibition of ribis (interest)
            are strictly governed by the most updated version of the{' '}
            <a
              href="https://heter-iska.com/wp-content/uploads/2025/05/Heter-iska-Jared.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <strong>Bris Pinchas Heter Iska</strong>
            </a>
            .
          </p>
        </div>
      )}

      <div className="footerBottomBar">
        <div className="footerBottomContent">
          <p className="footerCopyright">
            © {new Date().getFullYear()} Kav Haribis — קו הריבית. All rights reserved.
          </p>
          <div className="footerBottomMeta">
            <span>בס״ד</span>
            <span className="dotSeparator">•</span>
            <span>Torah Guidance for Responsible Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export function InteriorPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main>
      <SiteHeader />
      <section className="innerHero compactHero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      {children}
      <SiteFooter />
    </main>
  );
}
