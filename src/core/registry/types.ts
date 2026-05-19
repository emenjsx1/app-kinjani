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
}

export interface PropSchema {
  fields: PropField[];
}

export interface ResponsiveSchema {
  /** Future: which fields support per-breakpoint overrides. */
  perBreakpoint?: string[];
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
  aiHints?: { promptableFields: string[] };
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
