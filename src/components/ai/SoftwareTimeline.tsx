import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Shield, Workflow, Cable, Activity, Server, Brain, Lock, Boxes, CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { runFullstackBuild } from "@/core/ai/fullstack-os";
import type { FullstackAgentId, FullstackBuildSession, FullstackBuildStep } from "@/core/ai/fullstack-os";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AGENT_ICON: Record<FullstackAgentId, React.ComponentType<{ className?: string }>> = {
  "backend-architect": Brain,
  database: Database,
  auth: Lock,
  workflow: Workflow,
  api: Cable,
  security: Shield,
  realtime: Activity,
  state: Server,
  "business-logic": Boxes,
};

const AGENT_TONE: Record<FullstackAgentId, string> = {
  "backend-architect": "text-primary",
  database: "text-emerald-500",
  auth: "text-amber-500",
  workflow: "text-violet-500",
  api: "text-cyan-500",
  security: "text-red-500",
  realtime: "text-sky-500",
  state: "text-fuchsia-500",
  "business-logic": "text-orange-500",
};

function StatusIcon({ status }: { status: FullstackBuildStep["status"] }) {
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />;
  if (status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />;
}

interface Props {
  className?: string;
  defaultIntent?: string;
}

/**
 * SoftwareTimeline — live visualization of the fullstack build pipeline.
 * Lets the user trigger a generation and watch agents create software live.
 */
export function SoftwareTimeline({ className, defaultIntent = "" }: Props) {
  const [intent, setIntent] = useState(defaultIntent);
  const [session, setSession] = useState<FullstackBuildSession | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!intent.trim() || busy) return;
    setBusy(true);
    try {
      await runFullstackBuild({
        intent,
        onUpdate: (s) => setSession({ ...s, steps: [...s.steps] }),
      });
    } finally {
      setBusy(false);
    }
  };

  const graph = session?.graph;

  return (
    <div className={cn("glass rounded-2xl border border-border/50 p-5 space-y-4", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Fábrica de Software AI</h3>
          {session && (
            <Badge variant="secondary" className="ml-auto text-[10px] capitalize">
              {session.status}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Descreve o software. Os agentes constroem frontend, backend, base de dados, auth, APIs e workflows.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Ex: CRM para empresas de logística com pipeline de leads"
          onKeyDown={(e) => e.key === "Enter" && start()}
        />
        <Button onClick={start} disabled={busy || !intent.trim()} size="sm">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar"}
        </Button>
      </div>

      {session && (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {session.steps.map((step) => {
              const Icon = AGENT_ICON[step.agent];
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md hover:bg-muted/40"
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", AGENT_TONE[step.agent])} />
                  <span className={cn("font-medium shrink-0", AGENT_TONE[step.agent])}>
                    {step.agent}
                  </span>
                  <span className="text-muted-foreground truncate flex-1">{step.label}</span>
                  <StatusIcon status={step.status} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {graph && (
        <div className="border-t border-border/50 pt-3 space-y-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">domínio: {graph.domain}</Badge>
            <Badge variant="outline">{graph.data.tables.length} tabelas</Badge>
            <Badge variant="outline">{graph.api.endpoints.length} endpoints</Badge>
            <Badge variant="outline">{graph.workflows.workflows.length} workflows</Badge>
            <Badge variant="outline">{graph.runtime.realtimeChannels.length} canais realtime</Badge>
          </div>

          {graph.security.errors.length > 0 && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2">
              <div className="flex items-center gap-1.5 text-red-500 font-medium">
                <XCircle className="h-3 w-3" /> {graph.security.errors.length} bloqueios de segurança
              </div>
              <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                {graph.security.errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
          {graph.security.warnings.length > 0 && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                <AlertTriangle className="h-3 w-3" /> {graph.security.warnings.length} avisos
              </div>
            </div>
          )}
          {graph.security.passed.length > 0 && (
            <div className="text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> {graph.security.passed.length} verificações aprovadas
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SoftwareTimeline;
