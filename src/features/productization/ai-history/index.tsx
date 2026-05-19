import { useEffect, useState } from "react";
import { History, RotateCcw, User, Bot, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OperationLineageStore } from "@/core/ai/lineage/OperationLineageStore";
import type { OperationLineageNode } from "@/core/ai/lineage/types";

/**
 * AI History Panel.
 *
 * Live timeline of AI operations sourced from `OperationLineageStore`.
 * Surfaces prompt, agent, confidence, and rollback affordances so the
 * user can audit and revert any AI action.
 */

export function useLineageFeed(store: OperationLineageStore): OperationLineageNode[] {
  const [feed, setFeed] = useState<OperationLineageNode[]>(() => snapshot(store));

  useEffect(() => {
    // OperationLineageStore exposes a listener via `subscribe` (Phase 4.1).
    const maybeSubscribe = (
      store as unknown as { subscribe?: (fn: (n: OperationLineageNode) => void) => () => void }
    ).subscribe;
    if (!maybeSubscribe) return;
    const off = maybeSubscribe((_n) => setFeed(snapshot(store)));
    return () => off();
  }, [store]);

  return feed;
}

function snapshot(store: OperationLineageStore): OperationLineageNode[] {
  const maybeList = (
    store as unknown as { list?: (q?: unknown) => OperationLineageNode[] }
  ).list;
  if (typeof maybeList === "function") return maybeList.call(store).slice().reverse();
  // Fallback: read private map via getter if exposed
  const maybeAll = (store as unknown as { all?: () => OperationLineageNode[] }).all;
  if (typeof maybeAll === "function") return maybeAll().slice().reverse();
  return [];
}

interface AIHistoryPanelProps {
  store: OperationLineageStore;
  onRollback?: (node: OperationLineageNode) => void;
  className?: string;
}

export function AIHistoryPanel({ store, onRollback, className }: AIHistoryPanelProps) {
  const feed = useLineageFeed(store);

  if (feed.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 p-8 text-center",
          className,
        )}
      >
        <History className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Sem histórico ainda</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          As acções da IA aparecerão aqui à medida que forem aplicadas.
        </p>
      </div>
    );
  }

  return (
    <ol className={cn("relative space-y-3 border-l border-border pl-5", className)}>
      {feed.map((node, idx) => (
        <li key={node.metadata.id} className="relative">
          <span className="absolute -left-[27px] top-2 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card">
            {node.metadata.agent === "user" ? (
              <User className="h-2.5 w-2.5 text-foreground" />
            ) : (
              <Bot className="h-2.5 w-2.5 text-primary" />
            )}
          </span>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {node.metadata.agent}
                  </span>
                  <ConfidenceBadge value={node.metadata.confidence} />
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(node.metadata.createdAt)}
                  </span>
                </div>
                {node.metadata.reason && (
                  <p className="mt-1 line-clamp-2 text-sm text-foreground">{node.metadata.reason}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Estágio: {node.metadata.pipelineStage}
                  {node.children.length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" />
                      {node.children.length} derivada{node.children.length === 1 ? "" : "s"}
                    </span>
                  )}
                </p>
              </div>
              {onRollback && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => onRollback(node)}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reverter
                </Button>
              )}
            </div>
          </div>
          {idx === 0 && <span className="absolute -left-[31px] top-0 h-1 w-1 animate-pulse rounded-full bg-primary" />}
        </li>
      ))}
    </ol>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.8
      ? "bg-success/10 text-success"
      : value >= 0.5
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", tone)}>{pct}%</span>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
