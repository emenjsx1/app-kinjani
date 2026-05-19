/**
 * Phase 4 — Real Code Generation Engine.
 *
 * Core types shared by the TSX emitter, import resolver, file graph,
 * formatter, validator, and target adapters (Next.js App Router first).
 *
 * Design tenets:
 *  - Deterministic: same project in -> same files out.
 *  - Structured: code is built from typed AST-like nodes, never raw string LLM output.
 *  - Portable: emitted projects must be standalone (Next.js / npm).
 *  - Extensible: targets (Next App Router, Vite, Astro) and component emitters
 *    are pluggable.
 */
import type { Project, ProjectPage } from "@/core/projects/types";
import type { ProjectFile } from "@/core/filesystem/types";
import type { ComponentDefinition } from "@/core/registry/types";
import type { WebsiteSection } from "@/lib/website-templates";

/** Source-language tag for emitted files. */
export type EmitLang = "tsx" | "ts" | "css" | "json" | "md" | "html" | "mjs" | "js";

export interface EmittedFile {
  path: string;
  content: string;
  lang: EmitLang;
  /** Generator/emitter id that produced this file. */
  generatedBy: string;
  /** Source nodes / component ids this file was derived from. */
  sources?: string[];
}

export interface CodegenDiagnostic {
  severity: "info" | "warn" | "error";
  code: string;
  message: string;
  file?: string;
  componentId?: string;
}

/** Result of a single target run. */
export interface CodegenResult {
  files: EmittedFile[];
  diagnostics: CodegenDiagnostic[];
  graph: SerializedFileGraph;
  durationMs: number;
}

/** Context handed to every component emitter. */
export interface EmitContext {
  project: Project;
  page?: ProjectPage;
  target: CodegenTargetId;
  /** Stable id (e.g. section.id). Used for keys + sources tracking. */
  nodeId: string;
  /** Component registry entry. */
  definition: ComponentDefinition;
  /** Section data (for "section" category). */
  section?: WebsiteSection;
  /** Free-form props (for widgets / future composables). */
  props?: Record<string, unknown>;
  /** Mutable import-resolver scoped to the file being emitted. */
  imports: ImportRecorder;
  /** Mutable diagnostics sink. */
  diagnostics: CodegenDiagnostic[];
}

export interface ImportRecord {
  module: string;
  named?: string[];
  defaultImport?: string;
  typeOnly?: boolean;
}

export interface ImportRecorder {
  add(record: ImportRecord): void;
  list(): ImportRecord[];
}

/** Component emit contract. Returned JSX is composed by the page emitter. */
export interface ComponentEmitter {
  /** Component id (matches ComponentDefinition.id). */
  componentId: string;
  /** Emit the JSX expression for one instance. */
  emit(ctx: EmitContext): string;
  /** Files the emitter requires globally (rendered once per project). */
  files?(project: Project): EmittedFile[];
  /** Static imports the emitter needs for any usage. */
  imports?(ctx: EmitContext): ImportRecord[];
  /** Optional CSS / token output. */
  styles?(project: Project): string | null;
  /** Optional SEO / runtime metadata contributions. */
  metadata?(ctx: EmitContext): Record<string, unknown> | null;
}

export interface ComponentEmitterRegistry {
  register(emitter: ComponentEmitter): void;
  get(componentId: string): ComponentEmitter | undefined;
  fallback(): ComponentEmitter;
  all(): ComponentEmitter[];
}

export type CodegenTargetId =
  | "next-app-router"
  | "vite-react"
  | "astro"
  | "raw-tsx";

export interface CodegenTarget {
  id: CodegenTargetId;
  label: string;
  /** Emit a full project to this target. */
  emit(project: Project, ctx: TargetContext): Promise<CodegenResult>;
}

export interface TargetContext {
  emitters: ComponentEmitterRegistry;
  /** Hook for future ts-morph / Babel AST passes. */
  ast?: AstHost;
  /** Optional override flags. */
  flags?: CodegenFlags;
}

export interface CodegenFlags {
  /** Pretty-print output. Default true. */
  format?: boolean;
  /** Run syntax validation. Default true. */
  validate?: boolean;
  /** Emit tailwind config. Default true. */
  tailwind?: boolean;
  /** Emit package.json / lockfile placeholder. Default true. */
  packageJson?: boolean;
}

/** Placeholder for the ts-morph / Babel AST integration (Phase 4.x). */
export interface AstHost {
  parseTsx?(source: string, file: string): unknown;
  printTsx?(node: unknown): string;
}

/* ---------- File graph types ---------- */

export type FileGraphEdgeKind = "import" | "asset" | "style" | "component";

export interface FileGraphNode {
  path: string;
  kind: "page" | "layout" | "component" | "lib" | "asset" | "style" | "config" | "public";
  /** Component id if this node was emitted from a registry component. */
  componentId?: string;
  exports?: string[];
}

export interface FileGraphEdge {
  from: string;
  to: string;
  kind: FileGraphEdgeKind;
  specifier?: string;
}

export interface SerializedFileGraph {
  nodes: FileGraphNode[];
  edges: FileGraphEdge[];
}
