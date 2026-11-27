import { type Transition, type Variants } from 'framer-motion';

/**
 * Sovereign Motion Primitives
 * Intentional, purposeful animations utilizing exponential deceleration.
 */

// Natural deceleration curve (expo-out)
export const transitionExpo: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

// Subtle spring for micro-interactions (no bounce)
export const transitionSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

// Container stagger animation for dashboard feeds and grids
export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Item fade-in & upward slide
export const itemFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionExpo,
  },
};

// Modal and dialog reveal
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

// Micro-hover scale feedback for actionable cards and buttons
export const buttonPressAnimation = {
  scale: 0.985,
  transition: { duration: 0.08 },
};

