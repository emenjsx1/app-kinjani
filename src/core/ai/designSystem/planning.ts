/**
 * Constraint-aware planning bundle (Phase 4.8)
 *
 * Produces a compact, agent-injectable string describing the design system
 * boundaries an agent MUST respect when generating operations.
 *
 * Agents receive this BEFORE planning so they generate compliant ops on the
 * first try instead of relying on post-validation correction.
 */

import type { Project } from "@/core/projects/types";
import {
  FONT_WEIGHTS,
  RADIUS_SCALE,
  SPACING_SCALE,
  TYPOGRAPHY_SCALE,
  designSystem,
} from "./constraints";

export interface DesignConstraintBundle {
  spacingScale: readonly number[];
  radiusScale: readonly number[];
  typographyScale: readonly number[];
  fontWeights: readonly number[];
  colorFormat: "HSL `H S% L%`";
  /** Allowed theme color tokens, derived from current project theme keys. */
  themeColorTokens: string[];
  /** Allowed responsive breakpoints. */
  responsiveBreakpoints: ("mobile" | "tablet" | "desktop")[];
  /** Validation predicates serialised as human-readable rules. */
  rules: string[];
}

export function buildDesignConstraints(
  project: Project,
): DesignConstraintBundle {
  const themeColorTokens = Object.keys(project.theme ?? {}).filter((k) =>
    /color|background|foreground|primary|secondary|accent/i.test(k),
  );
  return {
    spacingScale: SPACING_SCALE,
    radiusScale: RADIUS_SCALE,
    typographyScale: TYPOGRAPHY_SCALE,
    fontWeights: FONT_WEIGHTS,
    colorFormat: "HSL `H S% L%`",
    themeColorTokens,
    responsiveBreakpoints: ["mobile", "tablet", "desktop"],
    rules: [
      "Use apenas valores das escalas (spacing, radius, typography).",
      "Cores devem estar no formato HSL `H S% L%` (nunca hex ou rgb).",
      "Pesos de fonte limitados ao conjunto fornecido.",
      "Reutilize tokens existentes do tema sempre que possível.",
      "Não criar IDs de secções novas — usar os IDs presentes no contexto.",
      "Operações não-retrocompatíveis devem ser marcadas como rollbackable=false.",
    ],
  };
}

/** Compact textual form suitable for prepending to an agent system prompt. */
export function constraintsToPrompt(bundle: DesignConstraintBundle): string {
  return [
    "## DESIGN SYSTEM CONSTRAINTS",
    `- Spacing scale (px): ${bundle.spacingScale.join(", ")}`,
    `- Radius scale (px): ${bundle.radiusScale.join(", ")}`,
    `- Typography scale (px): ${bundle.typographyScale.join(", ")}`,
    `- Font weights: ${bundle.fontWeights.join(", ")}`,
    `- Color format: ${bundle.colorFormat}`,
    `- Theme color tokens: ${bundle.themeColorTokens.join(", ") || "(none)"}`,
    `- Responsive breakpoints: ${bundle.responsiveBreakpoints.join(", ")}`,
    "## Rules",
    ...bundle.rules.map((r) => `- ${r}`),
  ].join("\n");
}

/** Inverse-check helpers — same logic agents are expected to follow. */
export const constraintValidators = {
  isAllowedSpacing(px: number): boolean {
    return SPACING_SCALE.includes(px as (typeof SPACING_SCALE)[number]);
  },
  isAllowedRadius(px: number): boolean {
    return RADIUS_SCALE.includes(px as (typeof RADIUS_SCALE)[number]);
  },
  isAllowedTypography(px: number): boolean {
    return TYPOGRAPHY_SCALE.includes(
      px as (typeof TYPOGRAPHY_SCALE)[number],
    );
  },
  isAllowedFontWeight(w: number): boolean {
    return FONT_WEIGHTS.includes(w as (typeof FONT_WEIGHTS)[number]);
  },
  isAllowedColor(value: string): boolean {
    return designSystem.isValidColor(value);
  },
};
