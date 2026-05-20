import type { InfraGraph } from "@/core/cloud/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Lock, Zap, Bell, HardDrive, Radio, Webhook, Server } from "lucide-react";

const iconFor = {
  database: Database,
  auth: Lock,
  "edge-function": Zap,
  scheduler: Bell,
  storage: HardDrive,
  realtime: Radio,
  webhook: Webhook,
} as const;

const statusTone: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  deploying: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  degraded: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
  "not-provisioned": "bg-muted text-muted-foreground border-border",
};

export function InfraPanel({ infra }: { infra: InfraGraph }) {
  return (
    <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Server className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Infraestrutura Live</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {infra.services.length} serviços
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {infra.services.length === 0 && (
          <div className="col-span-full text-xs text-muted-foreground italic py-6 text-center">
            Nenhum serviço derivado ainda. Gere uma aplicação para popular a infra.
          </div>
        )}
        {infra.services.map((s) => {
          const Icon = iconFor[s.kind as keyof typeof iconFor] ?? Server;
          return (
            <div
              key={s.id}
              className="flex items-start gap-2 p-2.5 rounded-lg border border-border/50 bg-background/40"
            >
              <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{s.kind}</div>
              </div>
              <Badge variant="outline" className={`text-[9px] ${statusTone[s.status]}`}>
                {s.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
