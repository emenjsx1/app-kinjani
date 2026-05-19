/**
 * Design system intelligence. Constraints the AI must respect when producing
 * operations. These are tokens, not free-form values.
 */

export const SPACING_SCALE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128] as const;
export const RADIUS_SCALE = [0, 2, 4, 6, 8, 12, 16, 24, 9999] as const;
export const TYPOGRAPHY_SCALE = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72] as const;
export const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800] as const;

export type SpacingToken = (typeof SPACING_SCALE)[number];
export type RadiusToken = (typeof RADIUS_SCALE)[number];
export type TypographyToken = (typeof TYPOGRAPHY_SCALE)[number];

const HSL_RE = /^\s*\d{1,3}\s+\d{1,3}%\s+\d{1,3}%\s*$/;

export const designSystem = {
  /** Snap arbitrary px to the closest spacing token. */
  snapSpacing(px: number): SpacingToken {
    return SPACING_SCALE.reduce((best, v) =>
      Math.abs(v - px) < Math.abs(best - px) ? v : best,
    ) as SpacingToken;
  },
  snapRadius(px: number): RadiusToken {
    return RADIUS_SCALE.reduce((best, v) =>
      Math.abs(v - px) < Math.abs(best - px) ? v : best,
    ) as RadiusToken;
  },
  snapTypography(px: number): TypographyToken {
    return TYPOGRAPHY_SCALE.reduce((best, v) =>
      Math.abs(v - px) < Math.abs(best - px) ? v : best,
    ) as TypographyToken;
  },
  /** Validate an HSL color string in the project's `H S% L%` format. */
  isValidColor(value: string): boolean {
    return HSL_RE.test(value);
  },
};
