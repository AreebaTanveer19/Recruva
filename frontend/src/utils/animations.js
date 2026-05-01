import { motion } from 'framer-motion';

/**
 * Animation variants for consistent animations across the app
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
  },
  viewport: { once: true, margin: '-100px' },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

/**
 * Animation preset collections for complex sequences
 */
export const animations = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  staggerItem,
};
