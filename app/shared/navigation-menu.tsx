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

import { useCart } from './cart-context';

export default function NavigationMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { setCartOpen, totalCount } = useCart();

  const closeMenu = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="menuButton"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Open website menu"
      >
        {open ? '✕' : '☰'}
      </button>
      <nav className={`nav completeNav ${open ? 'open' : ''}`}>
        <a href="/" onClick={closeMenu}>Home</a>
        <a href="/about-us" onClick={closeMenu}>About</a>
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
                <a href={url} key={url} onClick={closeMenu}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        ))}
        <a href="/contact" onClick={closeMenu}>Contact</a>
        <button
          type="button"
          className="headerCartIconBtn"
          onClick={() => {
            setCartOpen(true);
            closeMenu();
          }}
          aria-label="Open Shopping Cart"
        >
          <svg className="w-5 h-5 text-[#102a43]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span className="cartRedBadge">{totalCount}</span>
        </button>
        <a className="donateNav" href="/donate" onClick={closeMenu}>
          Donate
        </a>
      </nav>
    </>
  );
}
