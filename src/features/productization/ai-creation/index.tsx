import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIStreamEmitter } from "@/core/ai/streaming/StreamEmitter";
import { STAGE_LABELS_PT, type AIStreamStage } from "@/core/ai/streaming/StreamEvents";

/**
 * AI Creation Experience.
 *
 * Subscribes to an `AIStreamEmitter` and turns the operational stream into
 * a premium "alive" creation experience: stages light up sequentially,
 * counts update, errors flash, and a final celebratory state is shown.
 */

const ORDERED_STAGES: AIStreamStage[] = [
  "analyzing-context",
  "planning",
  "generating-operations",
  "validating",
  "checking-conflicts",
  "checking-permissions",
  "simulating",
  "applying",
  "snapshotting",
  "rendering",
];

export interface CreationProgressState {
  active: AIStreamStage | null;
  completed: Set<AIStreamStage>;
  operationsPlanned: number;
  operationsDone: number;
  lastMessage: string | null;
  error: string | null;
  done: boolean;
}

export function useAICreationProgress(emitter: AIStreamEmitter | null): CreationProgressState {
  const [state, setState] = useState<CreationProgressState>({
    active: null,
    completed: new Set(),
    operationsPlanned: 0,
    operationsDone: 0,
    lastMessage: null,
    error: null,
    done: false,
  });

  useEffect(() => {
    if (!emitter) return;
    const off = emitter.on((evt) => {
      setState((prev) => {
        const next: CreationProgressState = { ...prev, completed: new Set(prev.completed) };
        switch (evt.type) {
          case "stage": {
            if (prev.active && prev.active !== evt.stage) next.completed.add(prev.active);
            next.active = evt.stage;
            if (evt.message) next.lastMessage = evt.message;
            break;
          }
          case "plan":
            next.operationsPlanned = evt.envelopes.length;
            break;
          case "operation:result":
            next.operationsDone = prev.operationsDone + 1;
            break;
          case "message":
            next.lastMessage = evt.content;
            break;
          case "error":
            next.error = evt.message;
            break;
          case "done":
            if (prev.active) next.completed.add(prev.active);
            next.active = null;
            next.done = true;
            break;
        }
        return next;
      });
    });
    return () => {
      off();
    };
  }, [emitter]);

  return state;
}

interface CreationStagesProps {
  state: CreationProgressState;
  /** Stages to display, ordered. Defaults to canonical 10. */
  stages?: AIStreamStage[];
  className?: string;
}

export function CreationStages({ state, stages = ORDERED_STAGES, className }: CreationStagesProps) {
  return (
    <ol className={cn("space-y-1.5", className)}>
      {stages.map((stage) => {
        const isActive = state.active === stage;
        const isDone = state.completed.has(stage);
        return (
          <li
            key={stage}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all duration-300",
              isActive && "border-primary/40 bg-primary/5",
              isDone && !isActive && "border-success/30 bg-success/5 text-success",
              !isActive && !isDone && "border-border bg-card text-muted-foreground",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center">
              {isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : isDone ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span className="flex-1 truncate">{STAGE_LABELS_PT[stage] ?? stage}</span>
            {isActive && state.lastMessage && (
              <span className="truncate text-xs text-muted-foreground">{state.lastMessage}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface StreamingIndicatorProps {
  state: CreationProgressState;
  compact?: boolean;
}

export function StreamingIndicator({ state, compact }: StreamingIndicatorProps) {
  const progress = useMemo(() => {
    if (state.done) return 100;
    if (state.operationsPlanned === 0) {
      const idx = state.active ? ORDERED_STAGES.indexOf(state.active) : -1;
      if (idx < 0) return 0;
      return Math.round(((idx + 1) / ORDERED_STAGES.length) * 100);
    }
    return Math.round((state.operationsDone / state.operationsPlanned) * 100);
  }, [state]);

  const tone = state.error
    ? "from-destructive/30 to-destructive"
    : state.done
      ? "from-success/30 to-success"
      : "from-primary/30 to-primary";

  return (
    <div className={cn("flex items-center gap-3", compact ? "text-xs" : "text-sm")}>
      {state.error ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : state.done ? (
        <Sparkles className="h-4 w-4 text-success" />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      )}
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full bg-gradient-to-r transition-all duration-300", tone)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-muted-foreground">
          <span>
            {state.error
              ? state.error
              : state.done
                ? "Concluído"
                : state.active
                  ? STAGE_LABELS_PT[state.active] ?? state.active
                  : "A iniciar…"}
          </span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
