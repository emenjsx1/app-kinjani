import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Wand2, ArrowRight, Loader2, Check, Settings2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWebsiteAI } from "@/hooks/useWebsiteAI";
import { getCreativeComposition } from "@/lib/creative-composition";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { generateCompositionGraph } from "@/core/render/CompositionGenerator";
import { buildBrief } from "@/core/render/buildBrief";
import type { CompositionGraph } from "@/core/render/composition-graph";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface OpenCreatorWebsitePayload {
  name: string;
  type: "landing" | "institutional";
  niche?: string;
  nicheId?: string;
  templateId?: string;
  prompt?: string;
  customTemplate?: WebsiteTemplate;
  compositionGraph?: CompositionGraph;
}

interface OpenCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebsiteCreated: (payload: OpenCreatorWebsitePayload) => Promise<{ id: string } | null>;
  onOpenAdvanced?: () => void;
}

const EXAMPLES = [
  "Landing imobiliária de luxo, estética cinematográfica, paleta dourado sobre preto",
  "Fintech brutalista, tipografia agressiva, grids quebradas, fundo branco puro",
  "Startup AI estilo Apple, hero gigante, muito espaço em branco, animações sutis",
  "Marca de restaurante africano, paleta terrosa, fotografia editorial, magazine layout",
  "Agência criativa moderna, feel cinematográfico, vídeo de fundo, scroll narrativo",
  "Dashboard SaaS inspirado em Linear, dark mode, monoespaçado, denso",
  "Estúdio de fotografia, galeria masonry, tipografia serif, mood premium",
  "Marca de moda streetwear, vibes Y2K, cores neon, layout asymmetric",
];

type StageStatus = "pending" | "running" | "done";
interface Stage { id: string; label: string; status: StageStatus }

const INITIAL_STAGES: Stage[] = [
  { id: "intent",      label: "A interpretar a sua visão...",            status: "pending" },
  { id: "direction",   label: "A definir direção visual e paleta...",    status: "pending" },
  { id: "composition", label: "A construir sistema de composição...",    status: "pending" },
  { id: "components",  label: "A gerar componentes únicos...",            status: "pending" },
  { id: "content",     label: "A escrever o conteúdo com IA...",          status: "pending" },
  { id: "finalize",    label: "A finalizar hierarquia e interações...",  status: "pending" },
];

export function OpenCreator({ open, onOpenChange, onWebsiteCreated, onOpenAdvanced }: OpenCreatorProps) {
  const navigate = useNavigate();
  const { generateContent, applySectionsContent } = useWebsiteAI();

  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const stagesRef = useRef<Stage[]>(INITIAL_STAGES);

  const reset = () => {
    setPrompt(""); setName(""); setUseAI(true); setAdvancedOpen(false);
    setGenerating(false); setStages(INITIAL_STAGES); stagesRef.current = INITIAL_STAGES;
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const advanceStage = (id: string, status: StageStatus) => {
    const next = stagesRef.current.map(s => s.id === id ? { ...s, status } : s);
    stagesRef.current = next;
    setStages(next);
  };

  const inferName = (p: string) => {
    const firstWords = p.trim().split(/\s+/).slice(0, 4).join(" ");
    return firstWords.charAt(0).toUpperCase() + firstWords.slice(1);
  };

  const handleCreate = async () => {
    if (!prompt.trim() || prompt.trim().length < 12) {
      toast.error("Descreva a sua visão com pelo menos algumas palavras.");
      return;
    }
    const finalName = (name.trim() || inferName(prompt)).slice(0, 60);
    setGenerating(true);
    setStages(INITIAL_STAGES);
    stagesRef.current = INITIAL_STAGES;

    try {
      advanceStage("intent", "running");
      await sleep(550);
      advanceStage("intent", "done");

      advanceStage("direction", "running");
      await sleep(450);
      const brief = buildBrief({ prompt, websiteName: finalName });
      const creativeTemplate = getCreativeComposition({
        prompt, siteType: "open", websiteName: finalName,
      });
      advanceStage("direction", "done");

      advanceStage("composition", "running");
      await sleep(400);
      const compositionGraph = generateCompositionGraph(brief);
      advanceStage("composition", "done");

      advanceStage("components", "running");
      await sleep(300);
      advanceStage("components", "done");

      let customTemplate = creativeTemplate;
      if (useAI) {
        advanceStage("content", "running");
        const generated = await generateContent({
          websiteType: "landing",
          niche: "Open Build",
          templateName: "Composição Criativa",
          prompt,
          websiteName: finalName,
          sections: creativeTemplate.sections.map(s => s.type),
        });
        if (generated) {
          customTemplate = {
            ...creativeTemplate,
            sections: applySectionsContent(creativeTemplate.sections, generated).map((s, i) => ({
              ...s,
              variant: creativeTemplate.sections[i]?.variant ?? s.variant,
            })),
          };
        }
        advanceStage("content", "done");
      } else {
        advanceStage("content", "done");
      }

      advanceStage("finalize", "running");
      await sleep(350);
      advanceStage("finalize", "done");

      const result = await onWebsiteCreated({
        name: finalName,
        type: "landing",
        niche: "Open Build",
        nicheId: "open-build",
        templateId: "open-build-generated",
        prompt,
        customTemplate,
        compositionGraph,
      });

      if (result?.id) {
        toast.success("Site criado ✨");
        onOpenChange(false);
        navigate(`/websites/${result.id}/edit`);
      } else {
        throw new Error("persist failed");
      }
    } catch (e) {
      toast.error("Não foi possível criar o site. Tente novamente.");
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!generating) onOpenChange(o); }}>
      <DialogContent className="max-w-3xl p-0 border-0 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {!generating ? (
          <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="h-3 w-3" /> Open Builder
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Descreva qualquer coisa que queira criar
              </h1>
              <p className="text-muted-foreground">
                Sem templates. Sem formulários. A IA compõe um site único a partir da sua visão.
              </p>
            </div>

            <div className="relative">
              <Textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Landing imobiliária de luxo, estética cinematográfica, paleta dourado sobre preto, grids quebradas, scroll narrativo..."
                className="min-h-[160px] text-base resize-none bg-background/60 backdrop-blur border-2 focus:border-primary/40 rounded-2xl p-5 pr-32"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleCreate();
                }}
              />
              <Button
                onClick={handleCreate}
                disabled={prompt.trim().length < 12}
                className="absolute bottom-4 right-4 rounded-xl gap-2 shadow-lg"
                size="lg"
              >
                Criar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Inspire-se
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <button
                onClick={() => setAdvancedOpen(v => !v)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Opções avançadas
              </button>
              {advancedOpen && (
                <div className="mt-4 grid gap-4 md:grid-cols-2 p-4 rounded-xl bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="oc-name" className="text-xs">Nome do projeto</Label>
                    <Input
                      id="oc-name"
                      placeholder="Auto a partir do prompt"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Conteúdo gerado por IA</Label>
                      <p className="text-[11px] text-muted-foreground">Desligue para usar texto template</p>
                    </div>
                    <Switch checked={useAI} onCheckedChange={setUseAI} />
                  </div>
                  {onOpenAdvanced && (
                    <div className="md:col-span-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onOpenChange(false); onOpenAdvanced(); }}
                        className="text-xs"
                      >
                        Usar modo assistido (templates) →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 md:p-14 min-h-[460px] flex flex-col justify-center">
            <div className="space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Wand2 className="h-3 w-3 animate-pulse" /> A criar
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                A compor o seu site...
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
            </div>

            <ul className="space-y-3">
              {stages.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 text-sm transition-all duration-300",
                    s.status === "pending" && "opacity-40",
                    s.status === "running" && "opacity-100 translate-x-1",
                    s.status === "done" && "opacity-80",
                  )}
                >
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/50">
                    {s.status === "done" && <Check className="h-3.5 w-3.5 text-primary" />}
                    {s.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                    {s.status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                  </span>
                  <span className={cn(s.status === "running" && "text-foreground font-medium")}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
