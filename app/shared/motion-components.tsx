'use client';

import { motion } from 'framer-motion';

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionSpan = motion.span;
export const MotionA = motion.a;
export const MotionButton = motion.button;

export const smoothEase = [0.16, 1, 0.3, 1];

export const smoothFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
  transition: { duration: 0.85, delay, ease: smoothEase },
});

export const smoothCard = (index = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
  transition: { duration: 0.8, delay: (index % 4) * 0.07, ease: smoothEase },
  whileHover: { y: -4, transition: { duration: 0.35, ease: smoothEase } },
});
