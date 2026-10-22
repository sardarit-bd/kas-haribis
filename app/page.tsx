'use client';

import { motion } from 'framer-motion';
import CommunityImpact from './componnent/CommunityImpact';
import HeroSlider from './componnent/HeroSlider';
import OfferingsGrid from './componnent/OfferingsGrid';
import OurMission from './componnent/OurMission';
import SubscriptionForm from './ribis-alerts/subscription-form';
import FeaturedSeforim from './shared/featured-seforim';
import LandingFaq from './shared/landing-faq';
import { SiteFooter, SiteHeader } from './shared/site-shell';

const sectionVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader stickySponsor />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <HeroSlider />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <OurMission />
      </motion.div>

      {/* OfferingsGrid manages its own item-by-item scroll entrance animations */}
      <OfferingsGrid />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <FeaturedSeforim />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <CommunityImpact />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <LandingFaq />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <SubscriptionForm />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <section
          aria-label="Legal Disclaimer"
          className="bg-slate-50 border-t border-slate-200/80 py-8 sm:py-10"
        >
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-semibold tracking-wider text-[#102a43]/70 uppercase mb-2">
              Legal Notice &amp; Halachic Governance
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              All sales, transactions, agreements, and other dealings of any nature in which Kav Haribis is involved, whether directly or indirectly, that may involve any actual or potential concern of Ribis (interest prohibited under Jewish law), shall be governed by and subject to the most current version of Heter Iska Bris Pinchos, including any amendments or updates thereto.
            </p>
          </div>
        </section>
      </motion.div>

      <SiteFooter />
    </main>
  );
}


