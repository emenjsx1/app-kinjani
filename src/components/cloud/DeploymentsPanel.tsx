import { DeploymentEngine } from "@/core/cloud";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, Undo2 } from "lucide-react";
import { useState, useEffect } from "react";

const tone: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  building: "bg-amber-500/15 text-amber-600",
  deploying: "bg-amber-500/15 text-amber-600",
  live: "bg-emerald-500/15 text-emerald-600",
  failed: "bg-destructive/15 text-destructive",
  "rolled-back": "bg-yellow-500/15 text-yellow-600",
};

export function DeploymentsPanel() {
  const [deployments, setDeployments] = useState(DeploymentEngine.list());
  const [busy, setBusy] = useState(false);

  const refresh = () => setDeployments(DeploymentEngine.list());
  useEffect(() => {
    const i = setInterval(refresh, 1500);
    return () => clearInterval(i);
  }, []);

  const deploy = async (env: "preview" | "staging" | "production") => {
    setBusy(true);
    await DeploymentEngine.deploy({ environment: env });
    refresh();
    setBusy(false);
  };

  return (
    <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Rocket className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Deployments</h3>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => deploy("preview")}>
            Preview
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => deploy("staging")}>
            Staging
          </Button>
          <Button size="sm" disabled={busy} onClick={() => deploy("production")}>
            Production
          </Button>
        </div>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {deployments.length === 0 && (
          <div className="text-xs text-muted-foreground italic py-4 text-center">
            Nenhum deployment ainda.
          </div>
        )}
        {deployments.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-2 p-2 rounded-md border border-border/40 bg-background/40 text-xs"
          >
            <Badge variant="outline" className={`text-[9px] ${tone[d.status]}`}>
              {d.status}
            </Badge>
            <span className="font-medium capitalize">{d.environment}</span>
            <span className="text-muted-foreground tabular-nums">
              {new Date(d.createdAt).toLocaleTimeString()}
            </span>
            {d.durationMs && (
              <span className="text-muted-foreground">· {(d.durationMs / 1000).toFixed(1)}s</span>
            )}
            {d.url && (
              <a href={d.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-primary hover:underline">
                abrir <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {d.status === "live" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px]"
                onClick={async () => {
                  await DeploymentEngine.rollback(d.id);
                  refresh();
                }}
              >
                <Undo2 className="w-3 h-3 mr-1" /> rollback
              </Button>
            )}
            {d.error && <span className="ml-auto text-destructive text-[10px] truncate max-w-xs">{d.error}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
}
