/**
 * Phase 7 — Freeform AI Generation Lane
 *
 * Types for the freeform generation pipeline that lives ALONGSIDE the
 * deterministic registry/emitter pipeline. Nothing in here mutates the
 * deterministic core: freeform output is validated, sandboxed, optionally
 * promoted into a project-scoped registry, and consumed by the runtime
 * via isolated namespaces.
 */

import type { ComponentDefinition, RuntimeTarget } from "../registry/types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Generation modes                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

export type GenerationMode = "safe" | "creative";

export type FreeformArtifactKind =
  | "component"
  | "section"
  | "layout"
  | "hook"
  | "utility"
  | "form"
  | "animation"
  | "handler"
  | "composable";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Lifecycle                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

export type GeneratedLifecycle =
  | "draft"
  | "validated"
  | "promoted"
  | "deprecated"
  | "rolled-back";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Generation request / result                                            */
/* ─────────────────────────────────────────────────────────────────────── */

export interface FreeformGenerationRequest {
  projectId: string;
  prompt: string;
  kind: FreeformArtifactKind;
  /** Suggested module name without extension. */
  name?: string;
  /** Constrain target runtimes (defaults to all). */
  runtimeTargets?: RuntimeTarget[];
  /** Inject project design tokens / context. */
  designTokens?: Record<string, string>;
  /** Hard dependency allowlist (project-scoped). */
  allowedImports?: string[];
  /** Generation seed for reproducibility. */
  seed?: number;
  /** Author agent identity (for observability). */
  authorAgent?: string;
  /** Caller mode — only "creative" enables freeform. */
  mode: GenerationMode;
  /** Max repair attempts before giving up. */
  maxRepairs?: number;
}

export interface FreeformValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  line?: number;
  column?: number;
}

export interface FreeformValidationReport {
  ok: boolean;
  issues: FreeformValidationIssue[];
  ast: {
    imports: string[];
    exports: string[];
    jsxRoot?: string;
    hooks?: string[];
  };
  /** Truthy after every stage (parse, lint, types, runtime) succeeded. */
  passed: {
    parse: boolean;
    syntax: boolean;
    imports: boolean;
    forbidden: boolean;
    lint: boolean;
    types: boolean;
    runtime: boolean;
  };
}

export interface GeneratedArtifact {
  id: string;
  projectId: string;
  kind: FreeformArtifactKind;
  name: string;
  /** Final emitted TSX (post-repair, post-format). */
  source: string;
  /** Project-namespaced path used by runtime + export pipelines. */
  modulePath: string;
  /** Lifecycle state machine. */
  lifecycle: GeneratedLifecycle;
  /** Validation snapshot at acceptance time. */
  validation: FreeformValidationReport;
  metadata: GeneratedArtifactMetadata;
  /** History of all versions of this artifact (newest last). */
  history: GeneratedArtifactVersion[];
}

export interface GeneratedArtifactMetadata {
  authorAgent: string;
  generationPrompt: string;
  validationStatus: "passed" | "repaired" | "rejected";
  dependencyMap: string[];
  runtimeCompatibility: RuntimeTarget[];
  createdAt: number;
  updatedAt: number;
  seed?: number;
  repairs: number;
}

export interface GeneratedArtifactVersion {
  version: number;
  source: string;
  createdAt: number;
  validation: FreeformValidationReport;
  reason: "initial" | "repair" | "manual-edit" | "promotion" | "rollback";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Pipeline outcome                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

export type FreeformOutcome =
  | { status: "accepted"; artifact: GeneratedArtifact }
  | {
      status: "rejected";
      reason: string;
      lastSource?: string;
      report?: FreeformValidationReport;
    };

/* ─────────────────────────────────────────────────────────────────────── */
/*  Promotion (artifact → first-class project component)                   */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PromotionRequest {
  artifactId: string;
  /** Optional override for registry id (default = derived from artifact). */
  registryId?: string;
  /** Whether to make this component available to the AI registry. */
  exposeToAI?: boolean;
}

export interface PromotedComponent {
  artifact: GeneratedArtifact;
  definition: ComponentDefinition;
}
