'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const heroSlides = [
  {
    id: 1,
    image: '/kav-brand/home-hero.png',
    alt: 'A study desk combining Torah learning and financial research',
    eyebrow: 'A CENTER FOR HILCHOS RIBBIS',
    title: 'Welcome to Kav Haribis the Center.',
    description:
      ' Backed by Harav Pinchos Vind Shlita who leads a worldwide network of the Bais Horraah’s for Ribis Matters with the backing of with the backing of Harav Yitzchok Zilberstien Shlita, and Harav Sriel Rosenberg Shlita, Harav Menachem Mendel Shafran Shlita, Harav Naftaly Nusbaum Shlita, Harav Shamai Kehas Gross Shlita, Harav Shlomo Zafrani Shlita.',
    primaryCta: {
      text: 'Explore the Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Ask the Bais Horaah',
      href: '/bais-horaah',
    },
  },
  {
    id: 2,
    image: '/kav-brand/bank-research.png',
    alt: 'Comprehensive financial research and bank directory analysis',
    eyebrow: 'KOSHER BANKING DIRECTORY',
    title: 'Creating awareness in the laws of Ribis.',
    description:
      ' Backed by Harav Pinchos Vind Shlita who leads a worldwide network of the Bais Horraah’s for Ribis Matters with the backing of with the backing of Harav Yitzchok Zilberstien Shlita, and Harav Sriel Rosenberg Shlita, Harav Menachem Mendel Shafran Shlita, Harav Naftaly Nusbaum Shlita, Harav Shamai Kehas Gross Shlita, Harav Shlomo Zafrani Shlita.',
    primaryCta: {
      text: 'Search Kosher Bank Directory',
      href: '/bank-directory',
    },
    secondaryCta: {
      text: 'Heter Iska Library',
      href: '/heter-iska',
    },
  },
  {
    id: 3,
    image: '/kav-brand/bais-horaah.png',
    alt: 'Rabbinic consultations for Jewish business owners and individuals',
    eyebrow: 'FREE RABBINIC CONSULTATIONS',
    title: 'Welcome to Kav Haribis the Center.',
    description:
      ' Backed by Harav Pinchos Vind Shlita who leads a worldwide network of the Bais Horraah’s for Ribis Matters with the backing of with the backing of Harav Yitzchok Zilberstien Shlita, and Harav Sriel Rosenberg Shlita, Harav Menachem Mendel Shafran Shlita, Harav Naftaly Nusbaum Shlita, Harav Shamai Kehas Gross Shlita, Harav Shlomo Zafrani Shlita.',
    primaryCta: {
      text: 'Submit a Question to Bais Horaah',
      href: '/bais-horaah',
    },
    secondaryCta: {
      text: 'Listen to Shiurim',
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
      {heroSlides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.image}
              alt={slide.alt}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#102a43]/95 via-[#102a43]/80 to-transparent "></div>
            <div className="container px-4 sm:px-8 h-full flex items-center justify-between relative z-20 max-w-[1440px] mx-auto">
              <div className="max-w-3xl text-white">
                <p className="text-[#c69b46] font-bold text-xs sm:text-sm tracking-widest uppercase mb-3 hidden">
                  {slide.eyebrow}
                </p>
                {isActive && (
                  <motion.h1
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-2xl sm:text-4xl md:text-5xl font-semibold text-center md:text-left leading-tight tracking-tight text-white mb-4"
                  >
                    {slide.title}
                  </motion.h1>
                )}
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-6 text-center md:text-left py-5"
                  >
                    {slide.description}
                  </motion.p>
                )}

                <motion.div
                initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ color: 'white' }}
                    className="inline-flex items-center gap-2.5 px-5 py-3.5 pBG text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300"
                    href={slide.primaryCta.href}
                  >
                    {slide.primaryCta.text}
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="hidden md:block px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-colors"
                    href={slide.secondaryCta.href}
                  >
                    {slide.secondaryCta.text}
                  </motion.a>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: .9}}
                    animate={{ opacity: 1, scale: 1}}
                    transition={{ duration: 0.3, delay: 0.45 }}
              className="w-full hidden lg:flex items-center justify-end">
                <img className="object-contain h-[300px]" src="/affiliate.png" alt="affiliate" />
              </motion.div>
            </div>
          </div>
        );
      })}

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#c69b46] w-2.5 z-10' : 'bg-white/40 hover:bg-white/70'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

