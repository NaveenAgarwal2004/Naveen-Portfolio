// frontend/src/lib/animations.js
// Spring physics configuration for Framer Motion animations
// Replaces basic CSS transitions with organic, delightful spring animations

/**
 * Default spring configuration
 * - stiffness: How much tension in the spring (higher = faster)
 * - damping: Resistance to motion (higher = less bounce)
 * - mass: Weight of the object (higher = slower, more inertia)
 */
export const springConfig = {
  type: "spring",
  stiffness: 280,
  damping: 60,
  mass: 1
};

/**
 * Button spring animations
 * Provides tactile, responsive feel for interactive elements
 */
export const buttonSpring = {
  hover: { 
    scale: 1.02, 
    y: -2,
    transition: springConfig
  },
  tap: { 
    scale: 0.98, 
    y: 0,
    transition: { ...springConfig, stiffness: 400 }
  }
};

/**
 * Card spring animations
 * For project cards and content blocks
 */
export const cardSpring = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    type: "spring",
    stiffness: 100, 
    damping: 15,
    mass: 0.8
  }
};

/**
 * Hero entrance animations
 * Staggered appearance with spring physics
 */
export const heroSpring = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: springConfig
};

/**
 * Stagger children animations
 * For sequential entrance of multiple elements
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Fade in animation with spring
 */
export const fadeInSpring = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { 
    type: "spring",
    stiffness: 200,
    damping: 30
  }
};

/**
 * Slide in from left with spring
 */
export const slideInLeftSpring = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: springConfig
};

/**
 * Slide in from right with spring
 */
export const slideInRightSpring = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: springConfig
};

/**
 * Scale up animation with spring
 */
export const scaleUpSpring = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    type: "spring",
    stiffness: 200,
    damping: 20
  }
};

/**
 * Floating animation for particles and decorative elements
 */
export const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
