'use client';

import { useState } from 'react';
import { BiSolidDownArrow } from "react-icons/bi";
import { FaBars } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { useCart } from './cart-context';

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
  const { setCartOpen, totalCount } = useCart();

  const closeMenu = () => {
    setOpen(false);
    setActive('');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="lg:hidden text-2xl text-[#102a43] p-2 rounded-lg hover:bg-slate-100 transition focus:outline-none cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Open website menu"
      >
        {open ? <RxCross2 className='text-3xl text-gray-500' /> : <FaBars className='text-3xl text-gray-500'/>}
      </button>

      {/* Main Navigation */}
      <nav
        className={`
          ${open ? 'flex' : 'hidden'}
          lg:flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-8
          absolute lg:static top-[92px] left-0 w-full lg:w-auto
          bg-white lg:bg-transparent p-6 lg:p-0
          border-b lg:border-b-0 border-slate-200 shadow-xl lg:shadow-none
          z-40 text-[17px] font-medium text-gray-700
        `}
      >
        <a
          href="/"
          className="hover:text-[#c69b46] transition-colors py-2 lg:py-0"
          onClick={closeMenu}
        >
          Home
        </a>
        <a
          href="/about-us"
          className="hover:text-[#c69b46] transition-colors py-2 lg:py-0"
          onClick={closeMenu}
        >
          About
        </a>

        {Object.entries(groups).map(([name, links]) => {
          const isGroupActive = active === name;
          return (
            <div
              className="relative group"
              key={name}
            >
              <button
                type="button"
                className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-1.5 hover:text-[#c69b46] font-semibold py-2 lg:py-0 transition-colors cursor-pointer text-left"
                onClick={() => setActive(isGroupActive ? '' : name)}
                aria-expanded={isGroupActive}
              >
                <span>{name}</span>
                <span className="text-xs transition-transform group-hover:rotate-180 lg:group-hover:rotate-180">
                  <BiSolidDownArrow />
                </span>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`
                  ${isGroupActive ? 'flex' : 'hidden'}
                  lg:group-hover:flex lg:group-focus-within:flex
                  flex-col bg-white border border-slate-200/80 shadow-xl rounded-xl p-2.5
                  static lg:absolute top-full left-0 min-w-[230px] z-50 
                `}
              >
                {links.map(([label, url]) => (
                  <a
                    href={url}
                    key={url}
                    className="px-3.5 py-2 text-sm text-slate-700 hover:text-[#c69b46] hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        <a
          href="/contact"
          className="hover:text-[#c69b46] transition-colors py-2 lg:py-0"
          onClick={closeMenu}
        >
          Contact
        </a>

        <div className="flex items-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            type="button"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#102a43]/5 border border-[#102a43]/15 text-[#102a43] hover:bg-[#102a43] hover:text-white transition-all cursor-pointer group"
            onClick={() => {
              setCartOpen(true);
              closeMenu();
            }}
            aria-label="Open Shopping Cart"
          >
            <svg
              className="w-5 h-5 text-[#102a43] group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] font-extrabold min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow">
              {totalCount}
            </span>
          </button>

          <a
          style={{color:"white!important"}}
            className="inline-flex items-center justify-center bg-[#c69b46] hover:bg-[#b58a35] text-[#102a43] px-5 py-2.5 font-bold text-sm transition-all shadow-md shadow-[#c69b46]/20"
            href="/donate"
            onClick={closeMenu}
          >
            Donate
          </a>
        </div>
      </nav>
    </>
  );
}

