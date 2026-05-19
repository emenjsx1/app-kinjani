export type Breakpoint = "sm" | "md" | "lg" | "xl";

export const DEFAULT_BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const DEVICE_TO_BREAKPOINT: Record<"mobile" | "tablet" | "desktop", Breakpoint> = {
  mobile: "sm",
  tablet: "md",
  desktop: "lg",
};
