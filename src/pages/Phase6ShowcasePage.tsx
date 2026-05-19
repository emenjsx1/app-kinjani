import { useMemo, useState } from "react";
import { Sparkles, LayoutDashboard, Palette, Package, History, Settings2, Wand2, Store, Rocket } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  EmptyState,
  PageTransition,
  ProjectGrid,
  ProjectFilters,
  useProjectFilters,
  type DashboardProject,
  MarketplaceGrid,
  OnboardingWizard,
  PropertyInspector,
  useInspectorState,
  DesignTokensPanel,
  ExportCenter,
  RuntimeStatusStrip,
  AIHistoryPanel,
  CreationStages,
  StreamingIndicator,
  useAICreationProgress,
  WhatsAppCheckout,
  PaymentInstructions,
} from "@/features/productization";
import { AIStreamEmitter } from "@/core/ai/streaming/StreamEmitter";
import { OperationLineageStore } from "@/core/ai/lineage/OperationLineageStore";
import { SandpackRuntime } from "@/core/runtime/SandpackRuntime";
import type { Project } from "@/core/projects/types";

/**
 * Phase 6 Showcase — single page surfacing every productization primitive
 * so it can be reviewed, demoed, and wired into real pages incrementally.
 */
export default function Phase6ShowcasePage() {
  const projects = useMemo<DashboardProject[]>(
    () => [
      { id: "p1", name: "Restaurante Costa do Sol", status: "active", runtime: "ready", updatedAt: "Hoje, 14:32", template: "Restaurante", url: "#" },
      { id: "p2", name: "Salão Aura", status: "draft", runtime: "updating", updatedAt: "Ontem", template: "Salão" },
      { id: "p3", name: "Mercado da Baixa", status: "active", runtime: "error", updatedAt: "Há 3 dias", template: "Loja" },
      { id: "p4", name: "Curso Empreender", status: "archived", runtime: "idle", updatedAt: "Há 2 semanas", template: "Curso" },
    ],
    [],
  );
  const filters = useProjectFilters();
  const filtered = filters.apply(projects);
  const inspector = useInspectorState();

  const emitter = useMemo(() => new AIStreamEmitter(), []);
  const lineage = useMemo(() => new OperationLineageStore(), []);
  const runtime = useMemo(() => new SandpackRuntime(), []);
  const progress = useAICreationProgress(emitter);

  const demoProject: Project = {
    id: "demo",
    name: "Restaurante Costa do Sol",
    kind: "website",
    pages: [],
    assets: [],
    theme: { primary: "#00DF80", secondary: "#2DBE82", accent: "#1E8E5B", background: "#0F1B1A", text: "#F4F7F6", font: "Plus Jakarta Sans" },
    settings: {},
    metadata: {},
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <PageHeader
          eyebrow="Phase 6"
          title="Experiência Premium"
          description="Pré-visualização integrada de todas as superfícies de produto: app shell, dashboard, marketplace, IA, editor, exports e posicionamento África."
          actions={
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Novo projeto
            </Button>
          }
        />

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="dashboard" className="gap-1"><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-1"><Store className="h-3.5 w-3.5" />Templates</TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-1"><Wand2 className="h-3.5 w-3.5" />Onboarding</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1"><Sparkles className="h-3.5 w-3.5" />Criação IA</TabsTrigger>
            <TabsTrigger value="editor" className="gap-1"><Settings2 className="h-3.5 w-3.5" />Editor</TabsTrigger>
            <TabsTrigger value="tokens" className="gap-1"><Palette className="h-3.5 w-3.5" />Design Tokens</TabsTrigger>
            <TabsTrigger value="export" className="gap-1"><Package className="h-3.5 w-3.5" />Exportar</TabsTrigger>
            <TabsTrigger value="history" className="gap-1"><History className="h-3.5 w-3.5" />Histórico IA</TabsTrigger>
            <TabsTrigger value="positioning" className="gap-1"><Rocket className="h-3.5 w-3.5" />África</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <ProjectFilters value={filters.value} onChange={filters.setValue} />
            {filtered.length === 0 ? (
              <EmptyState title="Sem projetos" description="Crie o seu primeiro projeto para começar." />
            ) : (
              <ProjectGrid projects={filtered} />
            )}
            <RuntimeStatusStrip engine={runtime} />
          </TabsContent>

          <TabsContent value="marketplace">
            <MarketplaceGrid />
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingWizard onComplete={(p) => console.log("onboarding", p)} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <DemoStreamControls emitter={emitter} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Etapas de geração</h3>
                <CreationStages state={progress} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Indicador compacto</h3>
                <StreamingIndicator state={progress} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Canvas (demonstração)</p>
                <div className="mt-3 flex h-64 items-center justify-center rounded-md bg-muted/30 text-muted-foreground">
                  Pré-visualização do elemento selecionado
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-2">
                <PropertyInspector value={inspector.value} onChange={inspector.setValue} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens">
            <DesignTokensPanel />
          </TabsContent>

          <TabsContent value="export">
            <ExportCenter project={demoProject} />
          </TabsContent>

          <TabsContent value="history">
            <AIHistoryPanel store={lineage} onRollback={(n) => console.log("rollback", n.metadata.id)} />
          </TabsContent>

          <TabsContent value="positioning" className="grid gap-4 md:grid-cols-2">
            <WhatsAppCheckout phone="+258840000000" total={1250} defaultMessage="Encomenda do menu de marisco" />
            <PaymentInstructions
              config={{ receiver: "+258840000000", accountName: "Restaurante Costa do Sol", provider: "mpesa", reference: "REST-001" }}
              amount={1250}
            />
            <PaymentInstructions
              config={{ receiver: "+258870000000", accountName: "Salão Aura", provider: "emola" }}
              amount={500}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function DemoStreamControls({ emitter }: { emitter: AIStreamEmitter }) {
  const [running, setRunning] = useState(false);
  const stages: import("@/core/ai/streaming/StreamEvents").AIStreamStage[] = [
    "analyzing-context", "planning", "generating-operations", "validating", "checking-conflicts", "simulating", "applying", "rendering",
  ];
  const simulate = async () => {
    setRunning(true);
    emitter.emit({ type: "plan", envelopes: Array(6).fill({} as never) });
    for (const stage of stages) {
      emitter.emit({ type: "stage", stage });
      await new Promise((r) => setTimeout(r, 400));
      emitter.emit({ type: "operation:result", result: { ok: true } as never });
    }
    emitter.emit({ type: "done" });
    setRunning(false);
  };
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={simulate} disabled={running} className="gap-1">
        <Sparkles className="h-3.5 w-3.5" />
        {running ? "A simular…" : "Simular geração"}
      </Button>
    </div>
  );
}
