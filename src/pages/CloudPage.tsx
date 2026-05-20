import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExecutionTimeline } from "@/components/cloud/ExecutionTimeline";
import { LiveTerminal } from "@/components/cloud/LiveTerminal";
import { InfraPanel } from "@/components/cloud/InfraPanel";
import { DeploymentsPanel } from "@/components/cloud/DeploymentsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Cloud, Sparkles } from "lucide-react";
import { buildInfraGraph, DevOpsAgent, executionBus } from "@/core/cloud";
import type { FullstackGraph } from "@/core/ai/fullstack-os/types";

// Minimal sample graph so the page is useful even before the user generates one.
const sampleGraph: FullstackGraph = {
  domain: "saas",
  data: {
    tables: [
      {
        name: "projects",
        fields: [
          { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", nullable: false },
          { name: "name", type: "text", nullable: false },
          { name: "created_at", type: "timestamptz", nullable: false, defaultValue: "now()" },
        ],
        rls: [{ name: "own projects", command: "ALL", using: "auth.uid() = user_id", withCheck: "auth.uid() = user_id" }],
        realtime: true,
      },
    ],
  },
  auth: { signup: true, login: true, rbac: { roles: ["owner", "member"], defaultRole: "member" } },
  api: {
    endpoints: [{ path: "/api/projects", method: "GET", authRequired: true }],
    edgeFunctions: [{ name: "project-summary", description: "AI summary for a project" }],
  },
  workflows: { workflows: [] },
  security: { passed: [], warnings: [], errors: [] },
} as unknown as FullstackGraph;

export default function CloudPage() {
  const [infra, setInfra] = useState(() => buildInfraGraph(sampleGraph));

  const orchestrate = async () => {
    executionBus.log("DevOpsAgent", "Iniciando orquestração completa", "info");
    const plan = DevOpsAgent.plan("Promover build atual para produção", infra);
    await DevOpsAgent.execute(plan, infra);
    setInfra(buildInfraGraph(sampleGraph));
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Cloud Execution</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Camada real de execução, deploy, infra e observabilidade.
              Tudo aqui é genuíno — sem simulações fake.
            </p>
          </div>
          <Button onClick={orchestrate} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Orquestrar com DevOps Agent
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="runtime">Runtime</TabsTrigger>
            <TabsTrigger value="deploy">Deploys</TabsTrigger>
            <TabsTrigger value="observability">Observabilidade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfraPanel infra={infra} />
              <DeploymentsPanel />
            </div>
            <ExecutionTimeline />
          </TabsContent>

          <TabsContent value="runtime" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Arquitetura Híbrida</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">Browser Runtime</div>
                  <div className="text-muted-foreground mt-1">Sandbox em-browser. Execução real de JS.</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/40">
                  <div className="font-semibold">Remote Node</div>
                  <div className="text-muted-foreground mt-1">Aguardando provisionamento de WebContainer.</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/40">
                  <div className="font-semibold">Cloud Container</div>
                  <div className="text-muted-foreground mt-1">Backend de execução em nuvem não configurado.</div>
                </div>
              </div>
            </Card>
            <LiveTerminal />
          </TabsContent>

          <TabsContent value="deploy" className="space-y-4 mt-4">
            <DeploymentsPanel />
            <ExecutionTimeline height={260} />
          </TabsContent>

          <TabsContent value="observability" className="mt-4">
            <ExecutionTimeline height={520} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
