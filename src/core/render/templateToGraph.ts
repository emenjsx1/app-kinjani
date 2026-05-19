/**
 * Adapter — wraps a legacy WebsiteTemplate as a CompositionGraph so the
 * CompositionRenderer becomes the single rendering source of truth.
 *
 * Each enabled section becomes a `legacy-section` node inside a vertical
 * Stack root. The renderer delegates to an injected legacyRenderer that
 * knows how to draw the actual section component.
 */
import type { WebsiteTemplate } from "@/lib/website-templates";
import type { CompositionGraph, CompositionNode, GraphTheme } from "./composition-graph";

function hexToHslTriplet(hex?: string): string {
  if (!hex) return "0 0% 100%";
  const m = hex.replace("#", "");
  if (m.length !== 6) return "0 0% 100%";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function templateToGraph(template: WebsiteTemplate): CompositionGraph {
  const theme: GraphTheme = {
    primary: hexToHslTriplet(template.colors?.primary),
    secondary: hexToHslTriplet(template.colors?.secondary),
    accent: hexToHslTriplet(template.colors?.accent || template.colors?.primary),
    background: "0 0% 100%",
    text: "222 47% 11%",
    font: template.font || "Inter, sans-serif",
    mood: "editorial",
  };

  const sections = (template.sections || []).filter((s) => s.enabled !== false);

  const children: CompositionNode[] = sections.map((s, i) => ({
    id: `legacy-${s.id || i}`,
    type: "legacy-section",
    sectionType: s.type,
    content: (s.content || {}) as Record<string, unknown>,
    variant: s.variant,
    role: s.type,
  }));

  const root: CompositionNode = {
    id: "root",
    type: "stack",
    direction: "v",
    gap: 0,
    children,
  };

  return { version: 1, theme, root };
}
