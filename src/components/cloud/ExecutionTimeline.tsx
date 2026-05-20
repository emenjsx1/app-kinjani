import { useEffect, useState } from "react";
import { executionBus } from "@/core/cloud";
import type { ExecutionEvent } from "@/core/cloud/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const levelColor: Record<string, string> = {
  debug: "bg-muted text-muted-foreground",
  info: "bg-primary/15 text-primary",
  warn: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  error: "bg-destructive/15 text-destructive",
};

export function ExecutionTimeline({ height = 360 }: { height?: number }) {
  const [events, setEvents] = useState<ExecutionEvent[]>(() => executionBus.history());

  useEffect(() => {
    const unsub = executionBus.subscribe((e) => setEvents((prev) => [...prev, e].slice(-200)));
    return unsub;
  }, []);

  return (
    <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="font-semibold text-sm">Linha do Tempo de Execução</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">{events.length} eventos</Badge>
      </div>
      <ScrollArea style={{ height }} className="pr-2">
        <div className="space-y-1.5 font-mono text-xs">
          {events.length === 0 && (
            <div className="text-muted-foreground italic py-6 text-center">
              Aguardando eventos de execução...
            </div>
          )}
          {events.slice().reverse().map((e) => (
            <div key={e.id} className="flex items-start gap-2 py-1 border-b border-border/30">
              <span className="text-muted-foreground tabular-nums shrink-0">
                {new Date(e.ts).toLocaleTimeString([], { hour12: false })}
              </span>
              <Badge variant="outline" className={`shrink-0 text-[9px] px-1.5 py-0 ${levelColor[e.level]}`}>
                {e.kind}
              </Badge>
              <span className="text-foreground/90 break-all">{e.message}</span>
              {e.durationMs !== undefined && (
                <span className="ml-auto text-muted-foreground shrink-0">{e.durationMs.toFixed(0)}ms</span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
