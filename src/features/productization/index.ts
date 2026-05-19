/**
 * Phase 6 — Productization umbrella.
 *
 * One entry point for every premium product surface. Pages and the editor
 * import primitives from here:
 *
 *   import {
 *     PageHeader, EmptyState, ProjectGrid, MarketplaceGrid,
 *     OnboardingWizard, PropertyInspector, DesignTokensPanel,
 *     ExportCenter, RuntimeStatusStrip, AIHistoryPanel,
 *     CreationStages, WhatsAppCheckout, PaymentInstructions,
 *     PageTransition, lazyRoute, thumbnailEngine,
 *   } from "@/features/productization";
 */
export * from "./shell";
export * from "./motion";
export { PageTransition } from "./motion/PageTransition";
export * from "./dashboard";
export * from "./thumbnails";
export * from "./marketplace";
export * from "./positioning";
export * from "./ai-creation";
export * from "./ai-history";
export * from "./onboarding";
export * from "./property-panels";
export * from "./design-tokens";
export * from "./export-center";
export * from "./runtime-status";
export * from "./perf";
