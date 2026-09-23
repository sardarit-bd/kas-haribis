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
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

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

      <SiteFooter />
    </main>
  );
}


