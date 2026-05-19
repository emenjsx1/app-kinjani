import { memo, useEffect, useRef, useState } from "react";
import { Sparkles, Send, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project } from "@/core/projects/types";
import { useProfile } from "@/hooks/useProfile";
import { useTemplateBridge } from "../hooks/useTemplateBridge";
import { websiteAIService } from "@/core/ai/services/WebsiteAIService";
import { AIStreamEmitter } from "@/core/ai/streaming/StreamEmitter";
import { STAGE_LABELS_PT } from "@/core/ai/streaming/StreamEvents";
import { projectToTemplate } from "@/core/projects/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * AI chat panel. Routes prompts through the OperationPipeline-backed
 * WebsiteAIService, streaming pipeline stages back to the user.
 */
export const AIChatPanel = memo(function AIChatPanel({ project }: { project: Project | null }) {
  const bridge = useTemplateBridge();
  const { profile, deductCredits } = useProfile();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Descreve uma alteração — por exemplo \"muda a cor principal para verde\" ou \"reescreve o herói com tom mais profissional\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, stage]);

  const send = async () => {
    if (!input.trim() || loading || !project || !bridge) return;
    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setStage("A iniciar");

    if (!profile || profile.credits_balance < 1) {
      setMessages((m) => [
        ...m,
        { id: `e_${Date.now()}`, role: "assistant", content: "Sem créditos suficientes." },
      ]);
      setLoading(false);
      setStage(null);
      return;
    }
    await deductCredits(1, "ai_website_edit", "Edição com IA");

    const emitter = new AIStreamEmitter();
    const off = emitter.on((ev) => {
      if (ev.type === "stage") setStage(STAGE_LABELS_PT[ev.stage]);
    });

    try {
      const res = await websiteAIService.edit({
        project,
        prompt: userMsg.content,
        emitter,
        commit: (nextProject) => {
          // Adapt new project back into the legacy template the bridge expects.
          const tmpl = projectToTemplate(nextProject);
          bridge.setTemplate(tmpl, "ai edit");
        },
      });

      // Legacy template fallback path (if planner returned the old shape).
      const legacy = (res as { legacyTemplate?: unknown } | null)?.legacyTemplate;
      if (legacy) {
        bridge.setTemplate(legacy as Parameters<typeof bridge.setTemplate>[0], "ai edit");
      }

      const msg =
        res?.message ??
        (res && "applied" in res && res.applied?.length
          ? `Aplicadas ${res.applied.length} operação(ões).`
          : "Pronto.");
      setMessages((m) => [...m, { id: `a_${Date.now()}`, role: "assistant", content: msg }]);
      if (res && "applied" in res && res.applied?.length) toast.success("Alteração aplicada");
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `e_${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "Erro ao processar.",
        },
      ]);
    } finally {
      off();
      setLoading(false);
      setStage(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider">Assistente IA</h3>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-2.5">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs max-w-[85%] whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{stage ?? "a pensar..."}</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-2 space-y-1.5">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Descreve a alteração..."
          rows={2}
          className="text-xs resize-none"
        />
        <Button size="sm" className="w-full h-7" disabled={loading || !input.trim()} onClick={send}>
          <Send className="h-3 w-3 mr-1.5" />
          Enviar
        </Button>
      </div>
    </div>
  );
});
