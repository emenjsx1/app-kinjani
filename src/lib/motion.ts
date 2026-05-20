/**
 * Shared motion tokens for the premium experience layer.
 * Pair with framer-motion variants for consistent feel across the app.
 */
export const easeStandard = [0.2, 0, 0, 1] as const;
export const easeSpring = { type: "spring", stiffness: 320, damping: 28 } as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: easeStandard },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeStandard } },
};
