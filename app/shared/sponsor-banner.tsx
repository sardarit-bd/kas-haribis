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

  const baseSponsors = Array.from(
    { length: Math.max(1, Math.ceil(12 / sponsors.length)) },
    () => sponsors,
  ).flat();

  const sponsorCard = (sponsor: Sponsor, key: string) => {
    const clickable = sponsor.ad_type !== 'logo';
    return (
      <button
        key={key}
        className={`w-[150px] sm:w-[170px] shrink-0 flex flex-col items-center text-center p-3 transition-all duration-300 group ${
          clickable ? 'cursor-pointer hover:bg-white/90' : 'cursor-default'
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
        {/* Circle Logo Container */}
        <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] bg-white   flex items-center justify-center p-2 transition-all duration-300 overflow-hidden mb-2.5">
          {sponsor.image_key ? (
            <img
              src={sponsor.image_key}
              alt={sponsor.company_name}
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            <span className="text-[#102a43] font-serif font-bold text-lg sm:text-xl">
              {initials(sponsor.company_name)}
            </span>
          )}
        </div>

        {/* Item Title Below Logo */}
        <b className="text-[13px] sm:text-[17px] font-medium text-gray-900 max-w-[140px] truncate leading-tight mb-0.5 group-hover:text-[#c69b46] transition-colors">
          {sponsor.company_name}
        </b>
        <small className="text-[11px] text-[#637282] leading-tight">
          {clickable ? 'Click for details' : 'Proud Supporter'}
        </small>
      </button>
    );
  };

  return (
    <>
      <section
        className="py-10 sm:py-14 px-4 sm:px-8 bg-white  relative overflow-hidden"
        aria-label="Supporters of Kav Haribis"
      >
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <span className="text-[#c69b46] font-bold text-xs uppercase tracking-widest block mb-1.5 hidden">
            Community Support & Partnerships
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#102a43] mb-2 sm:mb-3">
            Our Proud Sponsors
          </h2>
          <p className="text-[#637282] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            We express our sincere appreciation to the generous businesses and donors whose support<br className="hidden sm:inline" />
            enables Kav Haribis to provide vital Torah education and community services worldwide.
          </p>
        </div>

        {/* Continuous Right-to-Left Sliding Conveyor */}
        <div className="topSponsorConveyor py-2 mb-6">
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
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center pt-6">
          <a
          style={{color:"white!important"}}
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold text-xs sm:text-sm  shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            href="/contact"
          >
            <span className='text-white'>Become a Sponsor</span>
            <span className="text-white text-base leading-none">→</span>
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
            className="relative w-full max-w-[720px] bg-white rounded-[10px] p-6 sm:p-[38px] shadow-2xl"
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
                
                <span className="block text-[#42515d] text-sm leading-[1.7] pt-8">
                  {selected.description ||
                    'We thank this business for supporting the Torah education and community work of Kav Haribis.'}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-[25px] pt-[20px] text-[#344756] text-sm">
              {selected.phone ? (
                <>
                  <span>
                    Telephone: <b className="text-[#102a43]">{selected.phone}</b>
                  </span>
                  <a
                  style={{color:"white"}}
                    href={phoneHref(selected.phone)}
                    className="w-full sm:w-auto px-[20px] py-[12px] bg-[#102a43] hover:bg-[#173f5f] text-white font-bold rounded-[4px] text-center transition-colors text-white"
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
