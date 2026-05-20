import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Globe, ExternalLink, Loader2, Sparkles, Monitor, Smartphone, Tablet, Paperclip, Mic, Square, Lightbulb, Hammer, X, Download, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/hooks/use-toast";
import { useWebsites, Website } from "@/hooks/useWebsites";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { injectRuntime } from "@/lib/inject-runtime";
import { PublishDialog } from "@/components/websites/PublishDialog";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  ts: number;
  action?: "chat" | "plan" | "edit";
  /** HTML snapshot APÓS esta mensagem (só em assistant com edit). Clica para reverter aqui. */
  htmlSnapshot?: string;
};

export default function WebsiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getWebsite, updateWebsite } = useWebsites();
  const [website, setWebsite] = useState<Website | null>(null);
  const [html, setHtml] = useState<string>("");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [busySeconds, setBusySeconds] = useState(0);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [mode, setMode] = useState<"build" | "plan">("build");
  const [attachments, setAttachments] = useState<{ name: string; type: string; dataUrl: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoRunRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const callEdge = async (fn: string, body: any, signal: AbortSignal) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(url, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });
    const rawText = await res.text();
    let json: any = {};
    try {
      json = rawText ? JSON.parse(rawText) : {};
    } catch {
      json = { error: rawText || `Resposta inválida de ${fn}` };
    }
    if (!res.ok) {
      const message = json?.error || json?.message || `Erro ${res.status}`;
      throw new Error(message);
    }
    return json;
  };

  const normalizeHtml = (value: string) => value.replace(/\s+/g, " ").trim();

  const stop = () => {
    abortRef.current?.abort();
  };

  useEffect(() => {
    (async () => {
      if (!id) return navigate("/websites");
      const w = await getWebsite(id);
      if (!w) return navigate("/websites");
      setWebsite(w);
      const existingHtml = (w as any).generated_html || "";
      const existingHistory = Array.isArray((w as any).chat_history) ? (w as any).chat_history : [];
      setHtml(existingHtml);
      setHistory(existingHistory);
      setLoading(false);

      // Auto-generate APENAS uma vez, e só se vier com ?fresh=1 (recém-criado)
      const isFresh = searchParams.get("fresh") === "1";
      if (isFresh && !didAutoRunRef.current && !existingHtml && existingHistory.length === 0 && w.config?.prompt) {
        didAutoRunRef.current = true;
        // Limpa o param para nunca repetir em refresh
        searchParams.delete("fresh");
        setSearchParams(searchParams, { replace: true });
        runGenerate(w.config.prompt, w.name);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [history, busy]);

  useEffect(() => {
    if (!busy) {
      setBusySeconds(0);
      return;
    }

    setBusySeconds(0);
    const timer = window.setInterval(() => {
      setBusySeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [busy]);

  const versions = useMemo(() => {
    return history
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => message.role === "assistant" && message.action === "edit" && !!message.htmlSnapshot)
      .reverse();
  }, [history]);

  const persist = async (newHtml: string, newHistory: ChatMsg[]) => {
    if (!website) return;
    await updateWebsite(website.id, {
      generated_html: newHtml,
      chat_history: newHistory,
    } as any);
  };

  const runGenerate = async (prompt: string, name?: string) => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    setBusyLabel("A criar o teu site...");
    const userMsg: ChatMsg = { role: "user", content: prompt, ts: Date.now() };
    const draftHistory = [...history, userMsg];
    setHistory(draftHistory);
    try {
      const data = await callEdge("generate-site-html", { prompt, websiteName: name || website?.name }, ctrl.signal);
      if (!data?.html) throw new Error(data?.error || "Sem resposta");
      const asst: ChatMsg = {
        role: "assistant",
        content: "Site criado ✨ Pede qualquer alteração — cores, secções, logo, links, equipa, contactos, ou pede para transformar em site multi-página (com rotas /sobre, /serviços, etc).",
        ts: Date.now(),
        action: "edit",
        htmlSnapshot: data.html,
      };
      const finalHistory = [...draftHistory, asst];
      setHtml(data.html);
      setHistory(finalHistory);
      await persist(data.html, finalHistory);
    } catch (e: any) {
      const aborted = e?.name === "AbortError" || ctrl.signal.aborted;
      const asst: ChatMsg = {
        role: "assistant",
        content: aborted ? "_Parado pelo utilizador._" : `⚠️ Não consegui criar: ${e?.message || "erro desconhecido"}. Tenta de novo ou reformula o pedido.`,
        ts: Date.now(),
        action: "chat",
      };
      const finalHistory = [...draftHistory, asst];
      setHistory(finalHistory);
      await persist(html, finalHistory);
    } finally {
      abortRef.current = null;
      setBusy(false);
      setBusyLabel("");
    }
  };

  const buildPayload = (text: string) => {
    const parts: string[] = [];
    if (mode === "plan") parts.push("[MODO PLANO — apenas descrever o plano de alterações em texto, NÃO alterar o HTML]");
    parts.push(text);
    if (attachments.length) {
      parts.push(`\n\nAnexos do utilizador (${attachments.length}): ${attachments.map(a => a.name).join(", ")}`);
    }
    return parts.join("\n");
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;
    const finalText = text || "(ver anexos)";
    setInput("");
    const sentAttachments = attachments;
    setAttachments([]);

    if (!html) {
      await runGenerate(buildPayload(finalText), website?.name);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    setBusyLabel(mode === "plan" ? "A elaborar plano..." : "A pensar...");
    const userMsg: ChatMsg = { role: "user", content: finalText + (sentAttachments.length ? `  📎 ${sentAttachments.length}` : ""), ts: Date.now() };
    const draft = [...history, userMsg];
    setHistory(draft);
    try {
      const data = await callEdge("edit-site-html", {
        html,
        instruction: finalText,
        history: draft.slice(-8),
        mode,
        attachments: sentAttachments,
      }, ctrl.signal);

      const action: "chat" | "plan" | "edit" = data?.action || (data?.html ? "edit" : "chat");
      const newHtml = action === "edit" && data?.html ? data.html : html;
      const didChangeHtml = action === "edit" && normalizeHtml(newHtml) !== normalizeHtml(html);
      const finalAction: "chat" | "plan" | "edit" = didChangeHtml ? action : action === "edit" ? "chat" : action;
      const asst: ChatMsg = {
        role: "assistant",
        content: didChangeHtml
          ? (data?.message || "Alteração aplicada.")
          : (data?.message || "Não encontrei uma alteração concreta para aplicar ao site actual."),
        ts: Date.now(),
        action: finalAction,
        htmlSnapshot: didChangeHtml ? newHtml : undefined,
      };
      const final = [...draft, asst];
      setHtml(didChangeHtml ? newHtml : html);
      setHistory(final);
      await persist(didChangeHtml ? newHtml : html, final);
    } catch (e: any) {
      const aborted = e?.name === "AbortError" || ctrl.signal.aborted;
      const asst: ChatMsg = {
        role: "assistant",
        content: aborted ? "_Parado pelo utilizador._" : `⚠️ Erro: ${e?.message || "falha desconhecida"}. Tenta reformular o pedido.`,
        ts: Date.now(),
        action: "chat",
      };
      const final = [...draft, asst];
      setHistory(final);
      await persist(html, final);
    } finally {
      abortRef.current = null;
      setBusy(false);
      setBusyLabel("");
    }
  };

  const revertTo = async (snapshot: string, idx: number) => {
    if (!snapshot) return;
    const trimmed = history.slice(0, idx + 1);
    setHtml(snapshot);
    setHistory(trimmed);
    await persist(snapshot, trimmed);
    toast({ title: "Revertido", description: "Site restaurado para este ponto." });
  };

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(website?.name || "site").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4);
    const out: { name: string; type: string; dataUrl: string }[] = [];
    for (const f of arr) {
      if (f.size > 8 * 1024 * 1024) {
        toast({ title: "Ficheiro muito grande", description: `${f.name} > 8MB`, variant: "destructive" });
        continue;
      }
      const dataUrl: string = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.readAsDataURL(f);
      });
      out.push({ name: f.name, type: f.type, dataUrl });
    }
    setAttachments((p) => [...p, ...out].slice(0, 6));
  };

  const toggleRecord = async () => {
    if (recording) {
      mediaRecRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recChunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && recChunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recChunksRef.current, { type: "audio/webm" });
        const dataUrl: string = await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.readAsDataURL(blob);
        });
        setAttachments((p) => [...p, { name: `audio-${Date.now()}.webm`, type: "audio/webm", dataUrl }]);
      };
      rec.start();
      mediaRecRef.current = rec;
      setRecording(true);
    } catch {
      toast({ title: "Microfone indisponível", variant: "destructive" });
    }
  };

  const publish = async () => {
    if (!website) return;
    const url = `${window.location.origin}/site/${website.id}`;
    const res = await updateWebsite(website.id, { status: "active", published_url: url });
    if (res) {
      setWebsite(res);
      toast({ title: "Publicado!", description: "Site online." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!website) return null;

  const deviceWidth = device === "mobile" ? 390 : device === "tablet" ? 768 : "100%";
  const elapsedLabel = busySeconds > 0 ? ` · ${busySeconds}s` : "";

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/websites")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">{website.name}</h1>
            <StatusBadge status={website.status} />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button size="sm" variant={device === "desktop" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setDevice("desktop")}><Monitor className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant={device === "tablet" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setDevice("tablet")}><Tablet className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant={device === "mobile" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setDevice("mobile")}><Smartphone className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadHtml} disabled={!html} title="Descarregar HTML">
            <Download className="h-3.5 w-3.5 mr-1.5" />Download
          </Button>
          {website.status === "active" && website.published_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={website.published_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Ver Online</a>
            </Button>
          )}
          <Button size="sm" onClick={publish} disabled={!html}>
            <Globe className="h-3.5 w-3.5 mr-1.5" />Publicar
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Chat */}
        <aside className="w-[380px] border-r flex flex-col min-h-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Assistente Kinjani</span>
          </div>
          {(busy || versions.length > 0) && (
            <div className="border-b px-4 py-3 space-y-3">
              {busy && (
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">A processar pedido{elapsedLabel}</p>
                    <p className="truncate">{busyLabel || "A pensar..."}</p>
                  </div>
                  <Button size="sm" variant="destructive" className="h-7 px-2.5 shrink-0" onClick={stop}>
                    <Square className="h-3 w-3 mr-1.5" />Pausar
                  </Button>
                </div>
              )}

              {versions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">Reverter versões</span>
                    <span className="text-[11px] text-muted-foreground">{versions.length} guardada{versions.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-1.5">
                    {versions.slice(0, 3).map(({ message, index }, versionIndex) => (
                      <button
                        key={`${message.ts}-${index}`}
                        onClick={() => revertTo(message.htmlSnapshot!, index)}
                        className="w-full flex items-start justify-between gap-3 rounded-lg border px-2.5 py-2 text-left hover:bg-muted/50 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">Versão {versions.length - versionIndex}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{message.content}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                          <Undo2 className="h-3 w-3" /> Reverter
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-w-0">
            {history.length === 0 && !busy && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Olá! Descreve o site que queres ou peça uma alteração.</p>
                <p className="text-xs">Exemplos:<br/>• "Cria um site de psicologia, calmo, com booking"<br/>• "Adiciona uma secção de testemunhos"<br/>• "Muda a cor principal para verde-escuro"<br/>• "Coloca botão 'WhatsApp' que abre wa.me/258840000000"</p>
              </div>
            )}
            {history.map((m, i) => {
              const isError = m.role === "assistant" && m.content.startsWith("⚠️");
              let displayContent = m.content;
              if (isError) {
                const match = m.content.match(/"message"\s*:\s*"([^"]+)"/);
                if (match) {
                  displayContent = `⚠️ ${match[1].split("\\n")[0]}`;
                } else if (m.content.length > 280) {
                  displayContent = m.content.slice(0, 280) + "…";
                }
              }
              return (
                <div key={i} className={m.role === "user" ? "flex justify-end min-w-0" : "group min-w-0"}>
                  <div className={cn(
                    "min-w-0 break-words [overflow-wrap:anywhere]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]"
                      : "text-sm text-foreground max-w-full whitespace-pre-wrap",
                    isError && "text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20"
                  )}>
                    {displayContent}
                    {m.role === "assistant" && m.action === "edit" && m.htmlSnapshot && (
                      <button
                        onClick={() => revertTo(m.htmlSnapshot!, i)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                        title="Reverter o site para este ponto"
                      >
                        <Undo2 className="h-3 w-3" /> Reverter para aqui
                      </button>
                    )}
                    {m.role === "assistant" && m.action === "plan" && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">· plano</span>
                    )}
                  </div>
                </div>
              );
            })}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{busyLabel || "A pensar..."}{elapsedLabel}</span>
              </div>
            )}
          </div>
          <div className="p-3 border-t">
            <div className="rounded-2xl border bg-background focus-within:border-primary/40 transition-colors overflow-hidden">
              {/* Attachments preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-muted rounded-md pl-2 pr-1 py-1 text-xs">
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate max-w-[140px]">{a.name}</span>
                      <button
                        onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                        className="p-0.5 rounded hover:bg-background hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={html ? (mode === "plan" ? "Pede um plano..." : "Descreve a alteração...") : "Descreve o site que queres criar..."}
                className="min-h-[72px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent px-3 pt-3 pb-1"
                disabled={busy}
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,audio/*,.pdf,.txt"
                    className="hidden"
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={busy} title="Anexar ficheiro">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={recording ? "destructive" : "ghost"}
                    className="h-8 w-8 rounded-full"
                    onClick={toggleRecord}
                    disabled={busy}
                    title={recording ? "Parar gravação" : "Gravar áudio"}
                  >
                    {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  <div className="mx-1 h-5 w-px bg-border" />

                  <div className="flex items-center gap-0.5 bg-muted/60 rounded-full p-0.5">
                    <button
                      onClick={() => setMode("build")}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition",
                        mode === "build" ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Hammer className="h-3 w-3" /> Construir
                    </button>
                    <button
                      onClick={() => setMode("plan")}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition",
                        mode === "plan" ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Lightbulb className="h-3 w-3" /> Planear
                    </button>
                  </div>
                </div>

                {busy ? (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={stop}
                    title="Parar"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={send}
                    disabled={!input.trim() && attachments.length === 0}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {recording && (
              <p className="mt-1.5 text-[11px] text-destructive flex items-center gap-1.5 px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                A gravar áudio... toca em ■ para parar.
              </p>
            )}
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center p-6">
          {html ? (
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all" style={{ width: deviceWidth, maxWidth: "100%", height: "calc(100vh - 7rem)" }}>
              <iframe srcDoc={injectRuntime(html)} title="preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-20">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Escreve um pedido no chat para começar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
