'use client';
import { useEffect, useState } from 'react';

const items = [
  ['Kosher Bank Directory', 'Research banks and lenders', '/bank-directory'],
  [
    'Businesses with a Heter Iska',
    'Browse the business directory',
    '/businesses-with-a-heter-iska',
  ],
  [
    'Kosher Loan Services',
    'Find appropriate financing resources',
    '/kosher-loan-service',
  ],
  [
    'Investment Opportunities',
    'Review kosher investment information',
    '/kosher-investment-opportunities',
  ],
  ['High-Yield Savings', 'Compare savings-account information', '/savings'],
  ['Heter Iska Library', 'Preview and obtain documents', '/heter-iska'],
  ['Bais Horaah', 'Submit a Ribbis question', '/bais-horaah'],
  ['Audio & Video Shiurim', 'Listen and learn', '/audio'],
  ['Articles & Gilyonos', 'Read practical Torah guidance', '/articles'],
  ['Halacha', 'Explore practical Hilchos Ribbis', '/halacha'],
  ['Seforim', 'Browse Kav Haribis publications', '/seforim'],
  [
    'Investment Certification',
    'Request a structured investment review',
    '/kosher-investment-certification',
  ],
  ['Programs', 'Education and community outreach', '/programs'],
  [
    'Genealogy Services',
    'Research potential ownership concerns',
    '/genealogy-services',
  ],
  [
    'Kav Haribis Membership',
    'Join free and manage your preferences',
    '/membership',
  ],
  ['Ribbis Alerts', 'View important community updates', '/ribis-alerts'],
  ['Donate', 'Support the Kav Haribis mission', '/donate'],
  [
    'Educational Center',
    'Coloring pages, pamphlets, and school resources',
    '/educational-center',
  ],
] as const;

export default function ServiceRotator() {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % items.length),
      4000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);
  const item = items[index];
  return (
    <div
      className="serviceRotator"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span>
        <small>KAV HARIBIS SERVICES</small>
        <b>
          {String(index + 1).padStart(2, '0')} / {items.length}
        </b>
      </span>
      <a key={item[0]} href={item[2]}>
        <div>
          <strong>{item[0]}</strong>
          <small>{item[1]}</small>
        </div>
        <em>→</em>
      </a>
      <i>
        <span style={{ width: `${((index + 1) / items.length) * 100}%` }} />
      </i>
    </div>
  );
}
