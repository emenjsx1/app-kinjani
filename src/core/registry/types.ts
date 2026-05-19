import type { ComponentType } from "react";

export type ComponentCategory = "section" | "widget";

export type FieldKind =
  | "string"
  | "text"
  | "richtext"
  | "image"
  | "color"
  | "number"
  | "boolean"
  | "select"
  | "list";

export interface PropField {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  description?: string;
  aiEditable?: boolean;
  /** Per-breakpoint override support; merged into ResponsiveRules at runtime. */
  responsive?: boolean;
}

export interface PropSchema {
  fields: PropField[];
}

import type { Breakpoint } from "../editor/breakpoints";

export interface ResponsiveRule {
  hidden?: boolean;
  props?: Record<string, unknown>;
}

export type ResponsiveRules = Partial<Record<Breakpoint, ResponsiveRule>>;

export interface ResponsiveSchema {
  /** Which fields support per-breakpoint overrides. */
  perBreakpoint?: string[];
  /** Default rules baked into the component definition. */
  defaults?: ResponsiveRules;
}

export interface ComponentSlot {
  id: string;
  label?: string;
  accepts: ComponentCategory[];
  min?: number;
  max?: number;
}

export interface DesignTokenHints {
  surface?: string;
  text?: string;
  accent?: string;
  spacing?: string;
  radius?: string;
}

export type RuntimeTarget =
  | "react-template"
  | "sandpack"
  | "webcontainer"
  | "remote"
  | "export-tsx";

export interface ExportCompatibility {
  tsx: boolean;
  html?: boolean;
  astro?: boolean;
}

export interface ComponentDefinition<TProps = unknown> {
  id: string;
  category: ComponentCategory;
  /** Maps to WebsiteSection.type for sections, widget type for widgets. */
  type: string;
  label: string;
  description?: string;
  icon?: string;
  variants: number[];
  defaultProps: TProps;
  schema: PropSchema;
  responsive?: ResponsiveSchema;
  responsiveRules?: ResponsiveRules;

  /** Composition / nested-component support. */
  slots?: ComponentSlot[];
  /** Allow free-form additional props (e.g. AI-injected fields). */
  dynamicProps?: boolean;

  /** Design system surface bindings. */
  designTokens?: DesignTokenHints;
  /** Style inheritance: id of another component whose tokens cascade in. */
  inherits?: string;

  /** AI generation metadata. */
  generationPrompt?: string;
  editableFields?: string[];
  aiHints?: { promptableFields: string[] };

  /** Runtime + export portability. */
  runtimeCompatibility?: RuntimeTarget[];
  exportCompatibility?: ExportCompatibility;

  /** Optional renderer reference. Phase 1 renders go through legacy paths. */
  Component?: ComponentType<unknown>;
}

export interface ComponentRegistry {
  register(def: ComponentDefinition): void;
  get(id: string): ComponentDefinition | undefined;
  getByType(category: ComponentCategory, type: string): ComponentDefinition | undefined;
  all(): ComponentDefinition[];
  byCategory(category: ComponentCategory): ComponentDefinition[];
}
