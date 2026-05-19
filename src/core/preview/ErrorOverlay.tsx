import { useEffect, useState } from "react";
import type { SandpackRuntime } from "@/core/runtime/SandpackRuntime";
import type { RuntimeEvent } from "@/core/runtime/RuntimeDiagnostics";

/**
 * Developer-quality runtime error overlay.
 *
 * Renders contextually classified errors on top of the running preview,
 * mirroring the affordances offered by Vite / Next.js / Sandpack overlays:
 *  - error category badge
 *  - message + stack
 *  - file/line pointer if known
 *  - dismiss action
 *
 * Visual only — no business logic. Pure subscription to the runtime's
 * RuntimeDiagnosticsBus.
 */
const ERROR_KINDS = new Set<RuntimeEvent["kind"]>([
  "error",
  "compile-error",
  "runtime-exception",
  "import-error",
  "dependency-error",
  "hydration-error",
]);

export function ErrorOverlay({ runtime }: { runtime: SandpackRuntime }) {
  const [active, setActive] = useState<RuntimeEvent | null>(null);

  useEffect(() => {
    const unsub = runtime.diagnostics().subscribe((evt) => {
      if (ERROR_KINDS.has(evt.kind)) setActive(evt);
    });
    return () => unsub();
  }, [runtime]);

  if (!active) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-4 bottom-4 z-50 rounded-lg border border-destructive/40 bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-destructive px-2 py-0.5 text-xs font-medium uppercase text-destructive-foreground">
              {labelFor(active.kind)}
            </span>
            {active.file && (
              <span className="truncate text-xs text-muted-foreground">
                {active.file}
                {active.line ? `:${active.line}` : ""}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{active.message}</p>
          {active.stack && (
            <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-[11px] leading-tight text-muted-foreground">
              {active.stack}
            </pre>
          )}
        </div>
        <button
          onClick={() => setActive(null)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function labelFor(kind: RuntimeEvent["kind"]): string {
  switch (kind) {
    case "compile-error":
      return "Compile";
    case "runtime-exception":
      return "Runtime";
    case "import-error":
      return "Import";
    case "dependency-error":
      return "Dependency";
    case "hydration-error":
      return "Hydration";
    default:
      return "Error";
  }
}
