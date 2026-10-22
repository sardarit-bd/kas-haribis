'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { trackSiteEvent } from './analytics-tracker';

type Sponsor = {
  id: number;
  company_name: string;
  ad_type: string;
  description?: string | null;
  phone?: string | null;
  image_key?: string | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sponsors')
      .then((response) => response.json())
      .then((data) => {
        setSponsors(data.sponsors?.length ? data.sponsors : [fallback]);
        setLoading(false);
      })
      .catch(() => {
        setSponsors([fallback]);
        setLoading(false);
      });
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

  if (pathname.startsWith('/admin')) return null;

  const baseSponsors = Array.from(
    { length: Math.max(1, Math.ceil(12 / (sponsors.length || 1))) },
    () => sponsors,
  ).flat();

  const sponsorCard = (sponsor: Sponsor, key: string) => {
    const clickable = sponsor.ad_type !== 'logo';
    return (
      <button
        key={key}
        className={`topSponsorCard conveyorSponsor shrink-0 flex items-center text-left gap-2.5 py-1 transition-all duration-300 group ${
          clickable ? 'cursor-pointer' : 'cursor-default'
        }`}
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
        {/* Circle/Square Logo Container */}
        <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] bg-white flex items-center justify-center transition-all duration-300 overflow-hidden rounded-sm shrink-0 border border-gray-200/60 shadow-2xs">
          {sponsor.image_key ? (
            <img
              src={sponsor.image_key}
              alt={sponsor.company_name}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            <span className="text-[#102a43] font-serif font-bold text-sm sm:text-base">
              {initials(sponsor.company_name)}
            </span>
          )}
        </div>

        {/* Item Title & Subtitle Beside Logo */}
        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
          <b className="text-xs sm:text-[13px] font-semibold text-gray-800 truncate leading-tight mb-0.5 w-full">
            {sponsor.company_name}
          </b>
          <small className="text-[11px] sm:text-xs font-normal text-gray-500/80 truncate w-full">
            {sponsor?.description}
          </small>
        </div>
      </button>
    );
  };

  return (
    <>
      <section
        className="px-4 sm:px-8 bg-gray-100 relative overflow-hidden flex items-center justify-center gap-1 sm:gap-3"
        aria-label="Supporters of Kav Haribis"
      >
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs sm:text-base font-serif font-semibold text-[#102a43]/60 leading-5.5">
            Our Proud<br/>Sponsors
          </span>
          <p className="text-[#637282] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed hidden">
            We express our sincere appreciation to the generous businesses and donors whose support<br className="hidden sm:inline" />
            enables Kav Haribis to provide vital Torah education and community services worldwide.
          </p>
        </div>

        {/* Continuous Right-to-Left Sliding Conveyor / Skeleton */}
        <div className="topSponsorConveyor py-1 sm:py-1">
          {loading ? (
            <div className="flex items-center gap-4 sm:gap-7 overflow-hidden w-full">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="topSponsorCard conveyorSponsor shrink-0 flex items-center gap-2.5 py-1 select-none"
                >
                  {/* Skeleton Logo Box */}
                  <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] bg-slate-200/90 animate-pulse rounded-sm shrink-0" />

                  {/* Skeleton Title & Subtitle */}
                  <div className="flex flex-col items-start gap-1.5 min-w-0 flex-1">
                    <div className="h-3.5 w-24 sm:w-28 bg-slate-200/90 animate-pulse rounded-xs" />
                    <div className="h-3 w-16 sm:w-20 bg-slate-200/60 animate-pulse rounded-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="topSponsorTrack">
              <div className="topSponsorGroup">
                {baseSponsors.map((sponsor, index) =>
                  sponsorCard(sponsor, `g1-${sponsor.id}-${index}`),
                )}
              </div>
              <div className="topSponsorGroup" aria-hidden="true">
                {baseSponsors.map((sponsor, index) =>
                  sponsorCard(sponsor, `g2-${sponsor.id}-${index}`),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center">
          <a
          style={{color:"white!important"}}
            className="hidden items-center gap-2 px-1 sm:px-3 py-2.5 sm:py-3 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold text-xs sm:text-sm  shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            href="/contact"
          >
            <span className='text-white'>Become a Sponsor</span>
          </a>
          <a href="/contact">
            <span className="text-xs  sm:text-base font-serif font-semibold text-[#102a43]/60 leading-5.5">
            Become a<br/>Sponsor
          </span>
          </a>
        </div>
      </section>

      {/* Modal Dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] bg-[#071521]/70 backdrop-blur-xs grid place-items-center p-4 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sponsor-title"
          onClick={() => setSelected(null)}
        >
          <section
            className="relative w-full max-w-[720px] bg-white p-6 sm:p-[38px] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-[17px] top-[10px] text-[#263848] text-[34px] leading-none hover:text-black cursor-pointer"
              onClick={() => setSelected(null)}
              aria-label="Close sponsor details"
            >
              <RxCross2 className='text-2xl'/>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-[15px] sm:gap-[32px] items-center text-center sm:text-left">
              <div className="h-[90px] sm:h-[165px] grid place-items-center pb-4 sm:pb-0 font-serif font-bold text-3xl sm:text-[45px] text-[#102a43]">
                {selected.image_key ? (
                  <img
                    src={selected.image_key}
                    alt={selected.company_name}
                    className="max-w-full max-h-[140px] object-contain"
                  />
                ) : (
                  initials(selected.company_name)
                )}
              </div>
              <div>
               
                <h2 id="sponsor-title" className="m-0 text-[#102a43] font-serif text-2xl sm:text-[35px] font-medium leading-tight">
                  {selected.company_name}
                </h2>
                
                <span className="block text-[#42515d]/90 text-base leading-[1.7] pt-4">
                  {selected.description ||
                    'We thank this business for supporting the Torah education and community work of Kav Haribis.'}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-[25px] pt-[20px] text-[#344756] text-md">
              {selected.phone ? (
                <>
                  <span className=''>
                    Telephone: <b className="text-[#102a43]">{selected.phone}</b>
                  </span>
                  <a
                  style={{color:"white"}}
                    href={phoneHref(selected.phone)}
                    className="w-full sm:w-auto px-[20px] py-[12px] bg-[#102a43] hover:bg-[#173f5f] text-white font-bold text-sm text-center transition-colors text-white"
                  >
                    Call Sponsor
                  </a>
                </>
              ) : (
                <span className="text-slate-500">
                  Contact information is available through Kav Haribis.
                </span>
              )}
            </div>
            <small className="block mt-[16px] text-[#7d8991] text-center text-xs hidden">
              These details are displayed on Kav Haribis. You have not left the website.
            </small>
          </section>
        </div>
      )}
    </>
  );
}
