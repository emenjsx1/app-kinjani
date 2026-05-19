/**
 * Phase 6 — Motion tokens.
 *
 * Single source of truth for easing curves, durations, and stagger
 * coefficients used across the premium shell, panels, and transitions.
 * Components import these so motion feels coherent across the product.
 */

export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const duration = {
  instant: 80,
  fast: 160,
  base: 240,
  slow: 360,
  hero: 520,
} as const;

export const stagger = {
  tight: 30,
  base: 60,
  loose: 100,
} as const;

/** CSS variable strings consumed by Tailwind arbitrary values. */
export const motionVars = {
  "--ease-standard": `cubic-bezier(${easing.standard.join(",")})`,
  "--ease-emphasized": `cubic-bezier(${easing.emphasized.join(",")})`,
  "--ease-spring": easing.spring,
} as const;
