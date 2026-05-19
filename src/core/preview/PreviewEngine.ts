import type { ReactNode } from "react";
import type { Project } from "@/core/projects/types";
import type { PreviewDiagnostics, PreviewHealth } from "./diagnostics";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface PreviewOptions {
  device?: PreviewDevice;
  zoom?: number;
  interactive?: boolean;
  embedConfig?: unknown;
  /** Optional breakpoint override (overrides device). */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

export type PreviewEngineId =
  | "react-template"
  | "sandpack"
  | "webcontainer"
  | "remote-runtime";

export interface PreviewEngineCapabilities {
  interactive: boolean;
  isolated: boolean;
  supportsConsole: boolean;
  supportsNetwork: boolean;
  supportsHmr?: boolean;
}

export interface PreviewEngine {
  id: PreviewEngineId;
  capabilities: PreviewEngineCapabilities;
  render(project: Project, opts?: PreviewOptions): ReactNode;
  health(): PreviewHealth;
  diagnostics(): PreviewDiagnostics;
  dispose?(): void;
}

/* -------------------------------------------------------------------------- */
/*  Engine registry (multi-engine switching)                                  */
/* -------------------------------------------------------------------------- */

type EngineFactory = () => PreviewEngine;

class PreviewEngineRegistryImpl {
  private factories = new Map<PreviewEngineId, EngineFactory>();
  private cache = new Map<PreviewEngineId, PreviewEngine>();

  register(id: PreviewEngineId, factory: EngineFactory): void {
    this.factories.set(id, factory);
  }

  get(id: PreviewEngineId): PreviewEngine | undefined {
    if (this.cache.has(id)) return this.cache.get(id);
    const factory = this.factories.get(id);
    if (!factory) return undefined;
    const engine = factory();
    this.cache.set(id, engine);
    return engine;
  }

  list(): PreviewEngineId[] {
    return Array.from(this.factories.keys());
  }

  dispose(id: PreviewEngineId): void {
    const engine = this.cache.get(id);
    engine?.dispose?.();
    this.cache.delete(id);
  }
}

export const previewEngineRegistry = new PreviewEngineRegistryImpl();
