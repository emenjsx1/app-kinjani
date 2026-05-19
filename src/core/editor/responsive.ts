/**
 * Responsive Engine.
 *
 * Models responsive property values keyed by breakpoint, with deterministic
 * resolution rules: if a value at the current breakpoint is missing, fall
 * back down through `lg → md → sm` (mobile-first cascade going up, fallback
 * going down for editing convenience).
 */
import type { Breakpoint } from "./breakpoints";
import { DEFAULT_BREAKPOINTS, DEVICE_TO_BREAKPOINT } from "./breakpoints";

export type ResponsiveValue<T> = Partial<Record<Breakpoint, T>>;

const FALLBACK_ORDER: Breakpoint[] = ["xl", "lg", "md", "sm"];

export function resolveResponsive<T>(
  value: ResponsiveValue<T> | undefined,
  bp: Breakpoint,
): T | undefined {
  if (!value) return undefined;
  if (value[bp] !== undefined) return value[bp];
  // walk down then up looking for a defined value
  const start = FALLBACK_ORDER.indexOf(bp);
  for (let i = start; i < FALLBACK_ORDER.length; i++) {
    const k = FALLBACK_ORDER[i];
    if (value[k] !== undefined) return value[k];
  }
  for (let i = start - 1; i >= 0; i--) {
    const k = FALLBACK_ORDER[i];
    if (value[k] !== undefined) return value[k];
  }
  return undefined;
}

export interface ResponsiveVisibility {
  hiddenOn?: Breakpoint[];
}

export function isHiddenAt(
  vis: ResponsiveVisibility | undefined,
  bp: Breakpoint,
): boolean {
  return !!vis?.hiddenOn?.includes(bp);
}

export function deviceBreakpoint(
  device: "desktop" | "tablet" | "mobile",
): Breakpoint {
  return DEVICE_TO_BREAKPOINT[device];
}

export function breakpointWidth(bp: Breakpoint): number {
  return DEFAULT_BREAKPOINTS[bp];
}
