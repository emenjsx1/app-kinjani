/**
 * DNA → CSS custom property bridge.
 * Each generated site gets its own CSS variable set scoped to a data-attribute,
 * so renderers can express the DNA without sharing global template tokens.
 */

import type { VisualDNA } from "./types";

export function dnaToCSSVars(dna: VisualDNA): Record<string, string> {
  return {
    "--dna-base": `${dna.rhythm.base}px`,
    "--dna-scale": `${dna.rhythm.scale}`,
    "--dna-gap": `${(dna.rhythm.base * dna.rhythm.scale).toFixed(2)}px`,
    "--dna-gap-lg": `${(dna.rhythm.base * dna.rhythm.scale * dna.rhythm.scale).toFixed(2)}px`,
    "--dna-pause": `${(dna.rhythm.base * 4 * (0.5 + dna.pacing.pauseRatio)).toFixed(2)}px`,
    "--dna-heading-scale": `${dna.typography.headingScale}`,
    "--dna-body-lh": `${dna.typography.bodyLineHeight}`,
    "--dna-tracking": `${dna.typography.tracking}em`,
    "--dna-weight-hero": `${dna.typography.weightHero}`,
    "--dna-weight-body": `${dna.typography.weightBody}`,
    "--dna-contrast": `${dna.hierarchy.contrast}`,
    "--dna-radius": `${dna.radius.base}px`,
    "--dna-radius-xl": `${dna.radius.expressive}px`,
    "--dna-motion-ms": `${dna.motion.durationMs}ms`,
    "--dna-motion-ease":
      dna.motion.personality === "spring" ? "cubic-bezier(.34,1.56,.64,1)"
      : dna.motion.personality === "snap" ? "cubic-bezier(.2,.9,.3,1)"
      : dna.motion.personality === "drift" ? "cubic-bezier(.42,0,.58,1)"
      : dna.motion.personality === "orbital" ? "cubic-bezier(.65,.05,.36,1)"
      : "linear",
    "--dna-asymmetry": `${dna.composition.asymmetryBias}`,
  };
}

export function dnaStyleAttr(dna: VisualDNA): React.CSSProperties {
  return dnaToCSSVars(dna) as unknown as React.CSSProperties;
}
