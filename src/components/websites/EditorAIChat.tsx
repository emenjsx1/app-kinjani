import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles, X, ImagePlus, Camera, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { WebsiteTemplate } from "@/lib/website-templates";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VisualAIContextBuilder, type VisualAttachment } from "@/core/ai/context/VisualAIContextBuilder";
import { runCreativeSession } from "@/core/ai/creative-os";
import { AgentActivityPanel } from "@/components/ai/AgentActivityPanel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  critique?: string;
}

interface EditorAIChatProps {
  template: WebsiteTemplate;
  websiteName: string;
  onTemplateUpdate: (template: WebsiteTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
  /** Optional: ref to the canvas surface so AI can "see" it. */
  canvasRef?: React.RefObject<HTMLElement>;
  /** Optional: live composition graph for textual visual context. */
  compositionGraph?: unknown;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function EditorAIChat({
  template,
  websiteName,
  onTemplateUpdate,
  isOpen,
  onClose,
  canvasRef,
  compositionGraph,
}: EditorAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        `Sou o teu copiloto visual. Posso ver o canvas e analisar referências.\n\n` +
        `• Cola, arrasta ou anexa screenshots / inspirações\n` +
        `• "Capturar canvas" envia uma snapshot ao vivo\n` +
        `• Pede críticas de ritmo, hierarquia, breathing room\n\n` +
        `O que vamos criar?`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [pending, setPending] = useState<VisualAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, deductCredits } = useProfile();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES);
    if (valid.length !== files.length) {
      toast.warning("Algumas imagens foram ignoradas (tipo ou tamanho > 5MB).");
    }
    const atts = await Promise.all(
      valid.map(async (f) => ({
        kind: "reference" as const,
        url: await fileToDataUrl(f),
        label: f.name,
      })),
    );
    setPending((p) => [...p, ...atts]);
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files = items
        .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
        .map((i) => i.getAsFile()!)
        .filter(Boolean);
      if (files.length) {
        e.preventDefault();
        addFiles(files);
      }
    },
    [addFiles],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, handlePaste]);

  const captureCanvas = async () => {
    const el = canvasRef?.current ?? document.querySelector<HTMLElement>("[data-canvas-root]");
    const snap = await VisualAIContextBuilder.captureElement(el);
    if (!snap) {
      toast.error("Não consegui capturar o canvas.");
      return;
    }
    setPending((p) => [...p, snap]);
    toast.success("Canvas capturado.");
  };

  const removePending = (i: number) => setPending((p) => p.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    if ((!inputValue.trim() && pending.length === 0) || isLoading) return;
    if (!profile || profile.credits_balance < 1) {
      toast.error("Sem créditos suficientes.");
      return;
    }

    const instruction = inputValue.trim() || "Analisa visualmente e melhora.";
    const attachments = pending;
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: instruction,
      images: attachments.map((a) => a.url),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setPending([]);
    setIsLoading(true);

    await deductCredits(1, "ai_website_edit", "Edição visual com IA");

    // Kick off multi-agent creative session in parallel — live agent activity surfaces in the studio panel.
    void runCreativeSession({
      intent: instruction,
      visual: {
        canvasImage: attachments[0]?.url,
        graph: (compositionGraph as never) ?? null,
        viewport:
          typeof window !== "undefined"
            ? { width: window.innerWidth, height: window.innerHeight }
            : undefined,
      },
    });


    try {
      const graphSummary = VisualAIContextBuilder.summarizeGraph(compositionGraph);
      const viewport =
        typeof window !== "undefined"
          ? {
              width: window.innerWidth,
              height: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio,
              mode: "desktop" as const,
            }
          : undefined;
      const ctx = VisualAIContextBuilder.build({
        instruction,
        attachments,
        graph: graphSummary,
        viewport,
      });
      const visualContext = [
        graphSummary ? `Graph (${graphSummary.nodeCount} nodes):\n${graphSummary.outline}` : "",
        viewport ? `Viewport: ${viewport.width}x${viewport.height}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data, error } = await supabase.functions.invoke("ai-edit-website", {
        body: {
          instruction,
          template,
          websiteName,
          images: attachments.map((a) => a.url),
          visualContext,
        },
      });

      if (error || !data?.success) throw new Error(data?.error || "Erro");

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.message || "Alteração aplicada!",
          critique: data.critique,
        },
      ]);
      if (data.template) {
        onTemplateUpdate(data.template);
        toast.success("Alteração aplicada!");
      }
      // Silence unused-var warning while preserving the built context for future use.
      void ctx;
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Erro ao processar. Tenta novamente." },
      ]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-[26rem] h-[560px] bg-card border rounded-xl shadow-2xl flex flex-col z-50",
        isDragging && "ring-2 ring-primary",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Copiloto Visual</span>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Eye className="w-3 h-3" /> vision
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {profile?.credits_balance ?? 0} créditos
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-3 pt-3">
        <AgentActivityPanel className="!max-h-40" limit={20} />
      </div>



      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[85%] space-y-2",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.images && msg.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {msg.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="rounded-md border border-border/30 object-cover w-full h-20"
                      />
                    ))}
                  </div>
                )}
                {msg.critique && (
                  <div className="text-xs italic opacity-80 border-t border-border/30 pt-2">
                    <span className="font-semibold not-italic">Crítica visual:</span> {msg.critique}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {pending.length > 0 && (
        <div className="px-3 pt-2 flex gap-2 flex-wrap border-t">
          {pending.map((a, i) => (
            <div key={i} className="relative group">
              <img src={a.url} alt={a.label} className="w-14 h-14 object-cover rounded-md border" />
              <button
                onClick={() => removePending(i)}
                className="absolute -top-1 -right-1 bg-background border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 border-t flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          title="Anexar imagens"
        >
          <ImagePlus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={captureCanvas} title="Capturar canvas">
          <Camera className="w-4 h-4" />
        </Button>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Descreve, anexa, ou cola uma referência…"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isLoading || (!inputValue.trim() && pending.length === 0)}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
