'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackSiteEvent } from './analytics-tracker';

type Sponsor = {
  id: number;
  company_name: string;
  ad_type: string;
  description?: string | null;
  phone?: string | null;
};
const fallback: Sponsor = {
  id: 0,
  company_name: 'Prime Services',
  ad_type: 'details',
  description:
    'Professional heating, cooling and plumbing services for homes and businesses.',
  phone: '848-285-8639',
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'KH'
  );
}
function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

export default function SponsorBanner() {
  const pathname = usePathname();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selected, setSelected] = useState<Sponsor | null>(null);

  useEffect(() => {
    fetch('/api/sponsors')
      .then((response) => response.json())
      .then((data) =>
        setSponsors(data.sponsors?.length ? data.sponsors : [fallback]),
      )
      .catch(() => setSponsors([fallback]));
  }, []);
  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
    };
  }, [selected]);

  if (pathname.startsWith('/admin') || sponsors.length === 0) return null;
  const repeated = Array.from(
    { length: Math.max(1, Math.ceil(6 / sponsors.length)) },
    () => sponsors,
  ).flat();
  const sponsorCard = (sponsor: Sponsor, key: string) => {
    const clickable = sponsor.ad_type !== 'logo';
    return (
      <button
        key={key}
        className="topSponsorCard conveyorSponsor"
        disabled={!clickable}
        onClick={() => {
          if (clickable) {
            trackSiteEvent('ad_click', {
              itemId: String(sponsor.id),
              itemName: sponsor.company_name,
            });
            setSelected(sponsor);
          }
        }}
        aria-label={
          clickable
            ? `Learn more about ${sponsor.company_name}`
            : `${sponsor.company_name}, proud supporter`
        }
      >
        <span className="topSponsorLogo">{initials(sponsor.company_name)}</span>
        <span className="topSponsorName">
          <b>{sponsor.company_name}</b>
          <small>{clickable ? 'Click for details' : 'Proud supporter'}</small>
        </span>
        {clickable && <span className="topSponsorArrow">›</span>}
      </button>
    );
  };
  return (
    <>
      <aside className="topSponsorStrip" aria-label="Supporters of Kav Haribis">
        <span className="topSponsorLabel">PROUD SUPPORTERS</span>
        <div className="topSponsorConveyor">
          <div className="topSponsorTrack">
            <div className="topSponsorGroup">
              {repeated.map((sponsor, index) =>
                sponsorCard(sponsor, `a-${sponsor.id}-${index}`),
              )}
            </div>
            <div className="topSponsorGroup">
              {repeated.map((sponsor, index) =>
                sponsorCard(sponsor, `b-${sponsor.id}-${index}`),
              )}
            </div>
          </div>
        </div>
        <a className="becomeSponsor" href="/contact-us">
          Become a sponsor
        </a>
      </aside>
      {selected && (
        <div
          className="sponsorModalBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sponsor-title"
          onClick={() => setSelected(null)}
        >
          <section
            className="sponsorDetailModal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="sponsorModalClose"
              onClick={() => setSelected(null)}
              aria-label="Close sponsor details"
            >
              ×
            </button>
            <div className="sponsorModalMain">
              <div className="sponsorModalLogo">
                {initials(selected.company_name)}
              </div>
              <div className="sponsorModalCopy">
                <p>PROUD SUPPORTER OF KAV HARIBIS</p>
                <h2 id="sponsor-title">{selected.company_name}</h2>
                <div className="goldRule" />
                <span>
                  {selected.description ||
                    'We thank this business for supporting the Torah education and community work of Kav Haribis.'}
                </span>
              </div>
            </div>
            <div className="sponsorContactRow">
              {selected.phone ? (
                <>
                  <span>
                    Telephone: <b>{selected.phone}</b>
                  </span>
                  <a href={phoneHref(selected.phone)}>Call Sponsor</a>
                </>
              ) : (
                <span>
                  Contact information is available through Kav Haribis.
                </span>
              )}
            </div>
            <small className="sponsorStayNote">
              These details are displayed on Kav Haribis. You have not left the
              website.
            </small>
          </section>
        </div>
      )}
    </>
  );
}
