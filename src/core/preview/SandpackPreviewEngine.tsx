import { createElement, useEffect, useState, type ReactNode } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import type { Project } from "@/core/projects/types";
import {
  previewEngineRegistry,
  type PreviewEngine,
  type PreviewEngineCapabilities,
  type PreviewOptions,
} from "./PreviewEngine";
import { DiagnosticsBus, type PreviewHealth } from "./diagnostics";
import { SandpackRuntime, type SandpackSnapshot } from "@/core/runtime/SandpackRuntime";
import { ErrorOverlay } from "./ErrorOverlay";

/**
 * Preview engine that renders the running app via Sandpack.
 *
 * The engine itself owns no React state — it delegates to a singleton
 * `SandpackRuntime` instance (or one injected via constructor) and
 * subscribes a React component to it.
 *
 * The engine remains decoupled from the codegen layer: callers feed the
 * runtime via the RegenerationScheduler (or directly via runtime.boot).
 */
export class SandpackPreviewEngine implements PreviewEngine {
  id = "sandpack" as const;
  capabilities: PreviewEngineCapabilities = {
    interactive: true,
    isolated: true,
    supportsConsole: true,
    supportsNetwork: true,
    supportsHmr: true,
  };

  private bus = new DiagnosticsBus();
  private healthState: PreviewHealth = { status: "idle" };

  constructor(public readonly runtime: SandpackRuntime = new SandpackRuntime()) {
    this.runtime.diagnostics().subscribe((evt) => {
      if (
        evt.kind === "error" ||
        evt.kind === "compile-error" ||
        evt.kind === "runtime-exception" ||
        evt.kind === "import-error" ||
        evt.kind === "dependency-error"
      ) {
        this.bus.error({ message: evt.message, stack: evt.stack, source: evt.source });
      } else {
        this.bus.log({
          level: evt.kind === "warn" ? "warn" : "log",
          message: evt.message,
          source: evt.source,
        });
      }
    });
  }

  render(_project: Project, opts?: PreviewOptions): ReactNode {
    this.healthState = { status: "rendering", lastRenderAt: Date.now() };
    const node = createElement(SandpackHost, {
      runtime: this.runtime,
      interactive: opts?.interactive !== false,
      onReady: () => {
        this.healthState = { status: "ready", lastRenderAt: Date.now() };
      },
      onError: (msg: string) => {
        this.bus.error({ message: msg, source: this.id });
        this.healthState = { status: "error", lastError: msg };
      },
    });
    return node;
  }

  health(): PreviewHealth {
    return { ...this.healthState };
  }

  diagnostics() {
    return this.bus.snapshot();
  }

  async dispose(): Promise<void> {
    this.bus.clear();
    await this.runtime.dispose();
    this.healthState = { status: "disposed" };
  }
}

/* -------------------------------------------------------------------------- */
/*  React host                                                                */
/* -------------------------------------------------------------------------- */

interface SandpackHostProps {
  runtime: SandpackRuntime;
  interactive: boolean;
  onReady: () => void;
  onError: (msg: string) => void;
}

function SandpackHost({ runtime, interactive, onReady, onError }: SandpackHostProps) {
  const [snap, setSnap] = useState<SandpackSnapshot>(() => runtime.snapshotState());

  useEffect(() => {
    const unsub = runtime.subscribe((s) => setSnap(s));
    return () => unsub();
  }, [runtime]);

  useEffect(() => {
    if (snap.version > 0) onReady();
  }, [snap.version, onReady]);

  if (snap.version === 0) {
    return createElement(
      "div",
      { className: "flex h-full w-full items-center justify-center text-sm text-muted-foreground" },
      "Booting sandbox runtime…",
    );
  }

  const sandpackFiles: Record<string, { code: string }> = {};
  for (const [path, code] of Object.entries(snap.files)) {
    sandpackFiles[path] = { code };
  }

  return createElement(
    SandpackProvider as unknown as React.ComponentType<Record<string, unknown>>,
    {
      template: snap.template,
      files: sandpackFiles,
      customSetup: {
        dependencies: snap.dependencies,
        devDependencies: snap.devDependencies,
        entry: snap.entry,
      },
      theme: "auto",
      options: {
        recompileMode: "delayed",
        recompileDelay: 250,
        autorun: true,
      },
    },
    createElement(
      SandpackLayout as unknown as React.ComponentType<{ children?: ReactNode }>,
      null,
      interactive
        ? createElement(SandpackCodeEditor as unknown as React.ComponentType<Record<string, unknown>>, {
            showLineNumbers: true,
            showTabs: true,
            wrapContent: true,
            style: { height: "100%" },
          })
        : null,
      createElement(SandpackPreview as unknown as React.ComponentType<Record<string, unknown>>, {
        showOpenInCodeSandbox: false,
        showRefreshButton: true,
        style: { height: "100%" },
      }),
    ),
    createElement(ErrorOverlay, { runtime }),
  );
}

previewEngineRegistry.register("sandpack", () => new SandpackPreviewEngine());
