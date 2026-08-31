'use client';

import { useState } from 'react';

const groups: Record<string, string[][]> = {
  Directories: [
    ['Kosher Banks', '/bank-directory'],
    ['Businesses with a Heter Iska', '/businesses-with-a-heter-iska'],
    ['Kosher Loan Services', '/kosher-loan-service'],
    ['Investment Opportunities', '/kosher-investment-opportunities'],
    ['Kosher Savings', '/savings'],
  ],
  Learning: [
    ['Educational Center', '/educational-center'],
    ['Audio & Shiurim', '/audio'],
    ['Articles', '/articles'],
    ['Halacha', '/halacha'],
    ['Common Questions', '/questions'],
    ['Seforim', '/seforim'],
    ['Kav Haribis Membership', '/membership'],
  ],
  Services: [
    ['Heter Iska', '/heter-iska'],
    ['Bais Horaah', '/bais-horaah'],
    ['Genealogy Services', '/genealogy-services'],
    ['Programs', '/programs'],
    ['Investment Certification', '/kosher-investment-certification'],
    ['Ribbis Alerts', '/ribis-alerts'],
  ],
};

export default function NavigationMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  return (
    <>
      <button
        className="menuButton"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Open website menu"
      >
        ☰
      </button>
      <nav className={open ? 'nav completeNav open' : 'nav completeNav'}>
        <a className='' href="/">Home</a>
        <a href="/about-us">About</a>
        {Object.entries(groups).map(([name, links]) => (
          <div
            className={active === name ? 'navGroup active' : 'navGroup'}
            style={{ padding: 0, margin: 0 }}
            key={name}
          >
            <button
              type="button"
              onClick={() => setActive(active === name ? '' : name)}
              aria-expanded={active === name}
            >
              {name}
            </button>
            <div>
              {links.map(([label, url]) => (
                <a href={url} key={url}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        ))}
        <a href="/contact">Contact</a>
        <a className="donateNav" href="/donate">
          Donate
        </a>
      </nav>
    </>
  );
}
