'use client';
import { useEffect, useState } from 'react';

const heroSlides = [
  {
    id: 1,
    image: '/kav-brand/home-hero.png',
    alt: 'A study desk combining Torah learning and financial research',
    eyebrow: 'A CENTER FOR HILCHOS RIBBIS',
    title: 'Torah clarity for a complex financial world.',
    description:
      'Kav Haribis brings practical guidance, trusted research, and accessible learning resources to individuals, families, businesses, and communities.',
    primaryCta: {
      text: 'Explore the Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Ask the Bais Horaah →',
      href: '/bais-horaah',
    },
  },
  {
    id: 2,
    image: '/kav-brand/bank-research.png',
    alt: 'Comprehensive financial research and bank directory analysis',
    eyebrow: 'KOSHER BANKING DIRECTORY',
    title: 'Comprehensive Bank & Lender Research.',
    description:
      'Search hundreds of commercial banks, mortgage lenders, and financial institutions with verified Heter Iska statuses and full research reports.',
    primaryCta: {
      text: 'Search Kosher Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Heter Iska Library →',
      href: '/heter-iska',
    },
  },
  {
    id: 3,
    image: '/kav-brand/bais-horaah.png',
    alt: 'Rabbinic consultations for Jewish business owners and individuals',
    eyebrow: 'FREE RABBINIC CONSULTATIONS',
    title: 'Expert Rabbinic Guidance for Your Business.',
    description:
      'Submit questions directly to experienced Rabbanim, review partnership agreements, and ensure 100% Ribis compliance in all financial transactions.',
    primaryCta: {
      text: 'Submit a Question to Bais Horaah',
      href: '/bais-horaah',
    },
    secondaryCta: {
      text: 'Listen to Shiurim →',
      href: '/audio',
    },
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  return (
    <section className="relative h-[480px] sm:h-[540px] md:h-[600px] w-full overflow-hidden bg-[#102a43]">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={slide.image}
            alt={slide.alt}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102a43]/95 via-[#102a43]/80 to-transparent "></div>
          <div className="container px-4 sm:px-8 h-full flex items-center relative z-20 ">
            <div className="max-w-2xl text-white">
              <p className="text-[#c69b46] font-bold text-xs sm:text-sm tracking-widest uppercase mb-3 hidden">
                {slide.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-5xl text-center md:text-left leading-tight font-serif font-meduim mb-4">
                {slide.title}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal mb-6 py-6 text-center md:text-left ">
                {slide.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <a
                  className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b58a35] text-[#102a43] font-meduim text-base shadow-lg transition-all transform hover:-translate-y-0.5"
                  href={slide.primaryCta.href}
                >
                  {slide.primaryCta.text}
                </a>
                <a
                  className="hidden md:block px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-meduim text-base border border-white/20 transition-colors"
                  href={slide.secondaryCta.href}
                >
                  {slide.secondaryCta.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 z-10">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#c69b46] w-8 z-10' : 'bg-white/40 hover:bg-white/70'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
