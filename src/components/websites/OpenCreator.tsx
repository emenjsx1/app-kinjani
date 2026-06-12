import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Wand2, ArrowUp, Loader2, Check, Settings2,
  Paperclip, Mic, Square, X, FileText, Image as ImageIcon, FileAudio, Globe2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { generateExperience, interpretIntent, type GenerativeResult } from "@/core/genesis";
import { inferWebsiteNameFromPrompt } from "@/core/genesis/StructuredTemplateBuilder";
import type { CompositionGraph } from "@/core/render/composition-graph";
import { supabase } from "@/integrations/supabase/client";
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
  generationSession?: GenerativeResult;
}

interface OpenCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebsiteCreated: (payload: OpenCreatorWebsitePayload) => Promise<{ id: string } | null>;
  onOpenAdvanced?: () => void;
}

const EXAMPLES = [
  { text: "Landing imobiliária de luxo, paleta dourado sobre preto", emoji: "🏛️" },
  { text: "Clínica médica moderna, cores azul e branco, formulário de marcação", emoji: "🏥" },
  { text: "Escritório de advocacia elegante, navy e dourado, equipa e áreas de prática", emoji: "⚖️" },
  { text: "Startup AI estilo Apple, hero gigante, muito espaço em branco", emoji: "🍎" },
  { text: "Restaurante africano, paleta terrosa, fotografia editorial", emoji: "🍲" },
  { text: "Dashboard SaaS estilo Linear, dark mode, bento grid", emoji: "📊" },
  { text: "Clínica dentária premium, sorriso perfeito, tratamentos e equipa", emoji: "🦷" },
  { text: "Agência criativa, vídeo de fundo, scroll narrativo assimétrico", emoji: "🎬" },
  { text: "Estúdio de fotografia, galeria masonry, mood premium", emoji: "📷" },
  { text: "SaaS de gestão, pricing 3 tiers, features bento, dark mode", emoji: "🚀" },
];

type StageStatus = "pending" | "running" | "done";
interface Stage { id: string; label: string; detail?: string; status: StageStatus; }

const INITIAL_STAGES: Stage[] = [
  { id: "intent",      label: "A interpretar a sua visão",         status: "pending" },
  { id: "direction",   label: "A definir direção visual e paleta", status: "pending" },
  { id: "composition", label: "A planear ritmo narrativo",         status: "pending" },
  { id: "components",  label: "A materializar composição visual",  status: "pending" },
  { id: "content",     label: "A escrever copy semântica",         status: "pending" },
  { id: "finalize",    label: "A auto-criticar e refinar",         status: "pending" },
];

interface Attachment {
  id: string;
  name: string;
  size: number;
  kind: "image" | "audio" | "document" | "text";
  file: File;
  preview?: string; // dataURL for images
  textContent?: string; // for .txt / .md
}

const MAX_FILE_MB = 10;

function attachmentKind(file: File): Attachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "text/plain" || file.type === "text/markdown" || /\.(md|txt)$/i.test(file.name)) return "text";
  return "document";
}

function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
async function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsText(file);
  });
}
async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function OpenCreator({ open, onOpenChange, onWebsiteCreated, onOpenAdvanced }: OpenCreatorProps) {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const stagesRef = useRef<Stage[]>(INITIAL_STAGES);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setPrompt(""); setName(""); setUseAI(true); setAdvancedOpen(false);
    setGenerating(false); setStages(INITIAL_STAGES); stagesRef.current = INITIAL_STAGES;
    setAttachments([]); setIsRecording(false); setRecordingSeconds(0); setTranscribing(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
  };

  useEffect(() => { if (!open) reset(); /* eslint-disable-next-line */ }, [open]);

  const updateStage = (id: string, patch: Partial<Stage>) => {
    const next = stagesRef.current.map(s => s.id === id ? { ...s, ...patch } : s);
    stagesRef.current = next;
    setStages(next);
  };

  /* ---------- ATTACHMENTS ---------- */
  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const accepted: Attachment[] = [];
    for (const f of list) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} excede ${MAX_FILE_MB}MB`);
        continue;
      }
      const kind = attachmentKind(f);
      const att: Attachment = {
        id: crypto.randomUUID(), name: f.name, size: f.size, kind, file: f,
      };
      if (kind === "image") att.preview = await readFileAsDataURL(f);
      if (kind === "text") {
        try { att.textContent = (await readFileAsText(f)).slice(0, 4000); } catch {}
      }
      accepted.push(att);
    }
    if (accepted.length) setAttachments(prev => [...prev, ...accepted]);
  };

  const removeAttachment = (id: string) =>
    setAttachments(prev => prev.filter(a => a.id !== id));

  /* ---------- AUDIO RECORDING ---------- */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        await transcribeAndAppend(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recTimerRef.current = window.setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível aceder ao microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
  };

  const transcribeAndAppend = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audioBase64: base64, mimeType: blob.type },
      });
      if (error) throw error;
      const text = (data as any)?.text?.trim();
      const fallbackMsg = (data as any)?.error as string | undefined;
      if (text) {
        setPrompt(prev => prev ? `${prev}\n${text}` : text);
        toast.success("Transcrição adicionada");
      } else if (fallbackMsg) {
        toast.error(fallbackMsg);
      } else {
        toast.error("Não foi possível transcrever.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao transcrever áudio");
    } finally {
      setTranscribing(false);
    }
  };

  /* ---------- DRAG & DROP ---------- */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  /* ---------- CREATE ---------- */
  const composedPrompt = () => {
    let p = prompt.trim();
    const textNotes = attachments.filter(a => a.kind === "text" && a.textContent).map(a => `\n\n[Conteúdo de ${a.name}]\n${a.textContent}`);
    const refs = attachments.filter(a => a.kind !== "text").map(a => `- ${a.name} (${a.kind})`);
    if (refs.length) p += `\n\n[Referências anexadas]\n${refs.join("\n")}`;
    if (textNotes.length) p += textNotes.join("");
    return p;
  };

  const inferName = (p: string) => inferWebsiteNameFromPrompt(p);

  const handleCreate = async () => {
    const final = composedPrompt();
    if (!final || final.length < 8) {
      toast.error("Descreva a sua visão com pelo menos algumas palavras.");
      return;
    }
    const finalName = (name.trim() || inferName(final)).slice(0, 60);
    setGenerating(true);
    setStages(INITIAL_STAGES);
    stagesRef.current = INITIAL_STAGES;

    try {
      updateStage("intent",      { status: "done", detail: "Pedido recebido" });
      updateStage("direction",   { status: "done", detail: "A preparar conversa criativa" });
      updateStage("composition", { status: "done", detail: "Render delegado ao chat" });
      updateStage("components",  { status: "done", detail: "—" });
      updateStage("content",     { status: "done", detail: "—" });
      updateStage("finalize",    { status: "running", detail: "A guardar projecto..." });

      const result = await onWebsiteCreated({
        name: finalName, type: "landing", niche: "AI Chat",
        nicheId: "ai-chat", templateId: "ai-chat", prompt: final,
      });

      if (result?.id) {
        updateStage("finalize", { status: "done", detail: "Projecto criado" });
        toast.success("Projecto criado ✨ O chat vai começar a gerar o site...");
        onOpenChange(false);
        navigate(`/editor/${result.id}?fresh=1`);
        return;
      }
      throw new Error("persist failed");
    } catch (e) {
      console.error("[OpenCreator]", e);
      toast.error("Não foi possível criar o site. Tente novamente.");
      setGenerating(false);
    }
  };

  const canSubmit = (prompt.trim().length >= 8 || attachments.length > 0) && !isRecording && !transcribing;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!generating) onOpenChange(o); }}>
      <DialogContent className="max-w-3xl p-0 border-0 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {!generating ? (
          <div
            className="p-8 md:p-10 space-y-7"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="h-3 w-3" /> Open Builder
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                O que vamos construir hoje?
              </h1>
              <p className="text-sm text-muted-foreground">
                Escreva, fale ou anexe ficheiros. A IA compõe um site único a partir da sua visão.
              </p>
            </div>

            {/* Composer */}
            <div className="relative rounded-2xl border-2 border-border/60 focus-within:border-primary/50 bg-background/70 backdrop-blur transition-all shadow-sm focus-within:shadow-lg focus-within:shadow-primary/5">
              {/* Attachments row */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 pb-0">
                  {attachments.map(a => (
                    <div key={a.id} className="group relative flex items-center gap-2 pl-2 pr-7 py-1.5 rounded-lg border border-border/60 bg-muted/40 text-xs">
                      {a.kind === "image" && a.preview ? (
                        <img src={a.preview} alt={a.name} className="h-6 w-6 rounded object-cover" />
                      ) : a.kind === "audio" ? (
                        <FileAudio className="h-3.5 w-3.5 text-primary" />
                      ) : a.kind === "text" ? (
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      ) : a.kind === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="max-w-[160px] truncate">{a.name}</span>
                      <span className="text-muted-foreground">· {formatSize(a.size)}</span>
                      <button
                        onClick={() => removeAttachment(a.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label="Remover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Landing imobiliária de luxo, estética cinematográfica, paleta dourado sobre preto…"
                className="min-h-[120px] text-[15px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 pt-3 pb-2 placeholder:text-muted-foreground/70"
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) handleCreate(); }}
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,audio/*,.pdf,.txt,.md,.doc,.docx"
                    className="hidden"
                    onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
                  />
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
                    disabled={isRecording || transcribing}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Anexar</span>
                  </Button>

                  {!isRecording ? (
                    <Button
                      type="button" variant="ghost" size="sm"
                      onClick={startRecording}
                      disabled={transcribing}
                      className="h-9 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                      <span className="hidden sm:inline text-xs">{transcribing ? "A transcrever…" : "Gravar"}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button" variant="ghost" size="sm"
                      onClick={stopRecording}
                      className="h-9 px-2 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                        <span className="relative h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs tabular-nums">
                        {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}
                      </span>
                    </Button>
                  )}

                  <div className="hidden md:flex items-center gap-1 ml-1 pl-2 border-l border-border/40">
                    <span className="text-[10px] text-muted-foreground">⌘ + ↵ para criar</span>
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={!canSubmit}
                  size="sm"
                  className="h-9 rounded-lg gap-1.5 shadow-sm"
                >
                  Criar <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Inspire */}
            <div className="space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Inspire-se</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex.text)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition text-left flex items-center gap-1.5"
                  >
                    <span>{ex.emoji}</span>
                    <span>{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced */}
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
                    <Input id="oc-name" placeholder="Auto a partir do prompt" value={name} onChange={(e) => setName(e.target.value)} />
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
                      <Button variant="ghost" size="sm" onClick={() => { onOpenChange(false); onOpenAdvanced(); }} className="text-xs">
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
                <Wand2 className="h-3 w-3 animate-pulse" /> Pensamento criativo em curso
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                A IA está a raciocinar sobre a sua visão
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
            </div>

            <ul className="space-y-4">
              {stages.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-start gap-3 text-sm transition-all duration-300",
                    s.status === "pending" && "opacity-30",
                    s.status === "running" && "opacity-100 translate-x-1",
                    s.status === "done" && "opacity-90",
                  )}
                >
                  <span className="h-6 w-6 mt-0.5 flex items-center justify-center rounded-full bg-muted/50 shrink-0">
                    {s.status === "done" && <Check className="h-3.5 w-3.5 text-primary" />}
                    {s.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                    {s.status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("leading-tight", s.status === "running" && "text-foreground font-medium")}>{s.label}</p>
                    {s.detail && <p className="mt-1 text-xs text-muted-foreground/90 leading-relaxed">{s.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
