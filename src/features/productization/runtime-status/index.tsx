import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Loader2, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeEngine, RuntimeState } from "@/core/runtime/types";

/**
 * Runtime Status experience.
 *
 *  - Compact badge for headers / cards.
 *  - Full strip for the editor bottom bar showing live state + errors.
 *
 * Subscribes to the engine's RuntimeDiagnosticsBus so errors surface
 * without forcing the host to re-poll.
 */

const STATE_LABEL: Record<RuntimeState, string> = {
  idle: "Em espera",
  starting: "A iniciar",
  ready: "Pronto",
  updating: "A compilar",
  error: "Erro",
  stopped: "Parado",
};

const STATE_TONE: Record<RuntimeState, string> = {
  idle: "bg-muted text-muted-foreground",
  starting: "bg-info/15 text-info",
  ready: "bg-success/15 text-success",
  updating: "bg-info/15 text-info",
  error: "bg-destructive/15 text-destructive",
  stopped: "bg-muted text-muted-foreground",
};

function StateIcon({ state }: { state: RuntimeState }) {
  if (state === "starting" || state === "updating") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  if (state === "ready") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (state === "error") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (state === "stopped") return <Power className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

export function RuntimeStatusBadge({
  engine,
  className,
}: {
  engine: RuntimeEngine;
  className?: string;
}) {
  const state = useRuntimeState(engine);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        STATE_TONE[state],
        className,
      )}
    >
      <StateIcon state={state} />
      {STATE_LABEL[state]}
    </span>
  );
}

interface RuntimeStatusStripProps {
  engine: RuntimeEngine;
  className?: string;
}

export function RuntimeStatusStrip({ engine, className }: RuntimeStatusStripProps) {
  const state = useRuntimeState(engine);
  const errors = useRuntimeErrors(engine);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card/80 px-3 py-2 backdrop-blur",
        className,
      )}
    >
      <RuntimeStatusBadge engine={engine} />
      <div className="min-w-0 flex-1 text-xs text-muted-foreground">
        Motor: <span className="font-medium text-foreground">{engine.id}</span>
        {engine.capabilities.hmr && <span className="ml-2">· HMR</span>}
        {engine.capabilities.isolated && <span className="ml-2">· isolado</span>}
      </div>
      {errors.length > 0 ? (
        <span className="inline-flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          {errors.length} erro{errors.length === 1 ? "" : "s"}
        </span>
      ) : (
        state === "ready" && (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saudável
          </span>
        )
      )}
    </div>
  );
}

function useRuntimeState(engine: RuntimeEngine): RuntimeState {
  const [s, setS] = useState<RuntimeState>(() => engine.status().state);
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const next = engine.status().state;
      setS((prev) => (prev === next ? prev : next));
      raf = window.setTimeout(tick, 500) as unknown as number;
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(raf);
    };
  }, [engine]);
  return s;
}

function useRuntimeErrors(engine: RuntimeEngine) {
  const [errors, setErrors] = useState(() => engine.snapshot().errors);
  useEffect(() => {
    const off = engine.diagnostics().subscribe(() => {
      setErrors(engine.snapshot().errors);
    });
    return () => {
      off();
    };
  }, [engine]);
  return errors;
}
