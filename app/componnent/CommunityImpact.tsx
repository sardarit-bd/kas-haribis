'use client';

import { useRef } from 'react';

const impactGalleryItems = [
  {
    title: 'Student Education',
    subtitle: 'Torah Lectures & Kehilla Seminars',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Shiurim & Classes',
    link: '/programs',
  },
  {
    title: 'Business Outreach',
    subtitle: 'Halachic Guidance for Modern Enterprise',
    src: '/kav-impact/heter-iska-presentation.jpg',
    category: 'Commercial Advisory',
    link: '/programs',
  },
  {
    title: 'Financial Education',
    subtitle: 'Responsible Commerce & Observance',
    src: '/kav-impact/financial-outreach.jpg',
    category: 'Education',
    link: '/programs',
  },
  {
    title: 'Community Outreach',
    subtitle: 'Raising Awareness on Hilchos Ribbis',
    src: '/kav-impact/community-event.jpg',
    category: 'Community',
    link: '/programs',
  },
  {
    title: 'Commercial Advisory',
    subtitle: 'Structuring Kosher Financial Contracts',
    src: '/kav-impact/business-visit.jpg',
    category: 'Heter Iska',
    link: '/programs',
  },
  {
    title: 'Rabbinic Recognition',
    subtitle: 'Bais Horaah Endorsements & Conferences',
    src: '/kav-impact/recognition-event.jpg',
    category: 'Rabbinical Advisory',
    link: '/programs',
  },
  {
    title: 'Heter Iska Advisory',
    subtitle: 'Custom Agreements & Legal Frameworks',
    src: '/kav-impact/heter-iska-presentation-2.jpg',
    category: 'Legal & Halacha',
    link: '/programs',
  },
  {
    title: 'Educational Shiurim',
    subtitle: 'Practical Guidance for Daily Life',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Learning',
    link: '/programs',
  },
];

export default function CommunityImpact() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-12 bg-white relative overflow-hidden">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Centered Header & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43]/80 mb-3 tracking-tight">
            Community Impact &amp; Gallery
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal mt-2">
            Promoting Hilchos Ribbis education, commercial advisory, and rabbinical guidance across kehillos and businesses worldwide.
          </p>
        </div>

        {/* Relative Slider Container with Side Navigation Buttons */}
        <div className="relative group px-2 sm:px-4">
          {/* Left Side Navigation Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 bg-white border border-slate-300/90 shadow-md text-[#102a43] hover:bg-[#102a43] hover:border-[#102a43] hover:text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Side Navigation Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 bg-white border border-slate-300/90 shadow-md text-[#102a43] hover:bg-[#102a43] hover:border-[#102a43] hover:text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Single Row Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {impactGalleryItems.map((item, idx) => (
              <a
                href={item.link}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start bg-white transition-all duration-300 group flex flex-col justify-between"
                key={idx}
              >
                <div>
                  {/* Image Container with Zoom */}
                  <div className="h-76 overflow-hidden relative bg-slate-100">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="py-6 px-2">
                    <h3 className="font-semibold text-lg sm:text-xl text-[#102a43] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-normal text-slate-500 mt-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

           {/* Centered Action Button with Styled Background */}
        <div className="mt-6 text-center hidden">
          <a
            href="/seforim"
            className="inline-flex items-center gap-2 pBG text-white font-semibold py-3.5 px-8 text-sm sm:text-base transition shadow-md hover:shadow-lg"
          >
            <span className='text-white'>View Full Catalog</span>
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
