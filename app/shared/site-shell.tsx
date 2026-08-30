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
          <span className="brandMark">KH</span>
          <span>
            <b>Kav Haribis</b>
            <small>קו הריבית</small>
          </span>
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
    <footer>
      <div>
        <div className="brand light">
          <span className="brandMark">KH</span>
          <span>
            <b>Kav Haribis</b>
            <small>קו הריבית</small>
          </span>
        </div>
        <p>Torah guidance for responsible commerce.</p>
      </div>
      <div className="footerLinks">
        <a href="/bank-directory">Bank Directory</a>
        <a href="/audio">Audio</a>
        <a href="/articles">Articles</a>
        <a href="/membership">Membership</a>
        <a href="/businesses-with-a-heter-iska">Businesses</a>
        <a href="/kosher-loan-service">Loan Services</a>
        <a href="/genealogy-services">Genealogy</a>
        <a href="/contact">Contact</a>
      </div>
      {showHeterNotice && (
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
      )}
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
