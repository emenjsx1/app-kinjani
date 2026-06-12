import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Globe, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Paperclip, 
  Mic, 
  Square, 
  Lightbulb, 
  Hammer, 
  X, 
  Download, 
  Undo2, 
  History as HistoryIcon, 
  ChevronLeft, 
  Menu,
  Bot,
  PlusCircle,
  Eye,
  GripHorizontal,
  Layout,
  Layers,
  ArrowRight,
  Settings,
  HelpCircle,
  Grid,
  CreditCard,
  Mail,
  Play
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { normalizeGeneratedHtml, parseAssistantJsonResponse } from "@/lib/generated-html";
import { PublishDialog } from "@/components/websites/PublishDialog";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import { SmoothPreviewIframe } from "@/components/websites/SmoothPreviewIframe";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  ts: number;
  action?: "chat" | "plan" | "edit";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [attachments, setAttachments] = useState<{ name: string; type: string; dataUrl: string }[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoRunRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving">("saved");
  const [zoom, setZoom] = useState(100);

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

  const streamEdge = async (
    fn: string,
    body: any,
    signal: AbortSignal,
    onDelta: (partialMessage: string) => void,
    onPhase: (phase: string) => void,
  ): Promise<{ action: "chat" | "plan" | "edit"; message: string; html?: string }> => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(url, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Erro ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    let finalRaw = "";

    const extractMessage = (s: string): string => {
      const i = s.indexOf('"message"');
      if (i < 0) return "";
      const colon = s.indexOf(":", i);
      if (colon < 0) return "";
      const q = s.indexOf('"', colon + 1);
      if (q < 0) return "";
      let out = "";
      let esc = false;
      for (let k = q + 1; k < s.length; k++) {
        const ch = s[k];
        if (esc) { out += ch; esc = false; continue; }
        if (ch === "\\") { esc = true; continue; }
        if (ch === '"') return out;
        out += ch;
      }
      return out;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });

      const endIdx = acc.indexOf("__KINJANI_END__");
      if (endIdx >= 0) {
        const tail = acc.slice(endIdx + "__KINJANI_END__".length).split("\n")[0];
        try { finalRaw = JSON.parse(tail).raw || ""; } catch { /* noop */ }
        acc = acc.slice(0, endIdx);
      }
      const errIdx = acc.indexOf("__KINJANI_ERROR__");
      if (errIdx >= 0) {
        throw new Error(acc.slice(errIdx + "__KINJANI_ERROR__".length).split("\n")[0] || "stream error");
      }

      let phase = "A interpretar pedido";
      if (acc.includes('"action":"edit"') || acc.includes('"action": "edit"')) {
        phase = (acc.includes("<!DOCTYPE") || acc.includes("<html")) ? "A construir o site" : "A escrever resposta";
      } else if (acc.includes('"action"')) {
        phase = "A escrever resposta";
      }
      onPhase(phase);
      onDelta(extractMessage(acc));
    }

    const raw = finalRaw || acc;
    const parsed: any = parseAssistantJsonResponse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { action: "chat", message: raw.slice(0, 800) || "Não consegui processar a resposta." };
    }
    const action = parsed.action === "edit" || parsed.action === "plan" ? parsed.action : "chat";
    let newHtml: string | undefined;
    if (action === "edit") {
      newHtml = normalizeGeneratedHtml(
        String(parsed.html || "").replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim(),
      );
      if (!newHtml.toLowerCase().includes("<html")) {
        return { action: "chat", message: parsed.message || "Não consegui gerar HTML válido." };
      }
    }
    return { action, message: String(parsed.message || ""), html: newHtml };
  };

  const sanitizeHistory = (items: ChatMsg[]) => {
    return items.map((item) => {
      if (item.role !== "assistant") return item;
      const parsed = parseAssistantJsonResponse(item.content);
      if (!parsed || typeof parsed !== "object") return item;

      const action = parsed.action === "edit" || parsed.action === "plan" ? parsed.action : item.action ?? "chat";
      const normalizedSnapshot = typeof parsed.html === "string" && parsed.html.trim()
        ? normalizeGeneratedHtml(parsed.html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim())
        : item.htmlSnapshot;

      return {
        ...item,
        action,
        content: typeof parsed.message === "string" && parsed.message.trim() ? parsed.message.trim() : item.content,
        htmlSnapshot: normalizedSnapshot,
      };
    });
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  useEffect(() => {
    (async () => {
      if (!id) return navigate("/websites");
      const w = await getWebsite(id);
      if (!w) return navigate("/websites");
      setWebsite(w);
      const existingHtml = normalizeGeneratedHtml((w as any).generated_html || "");
      const rawHistory = Array.isArray((w as any).chat_history) ? (w as any).chat_history : [];
      const existingHistory = sanitizeHistory(rawHistory);
      setHtml(existingHtml);
      setHistory(existingHistory);
      setLoading(false);

      const htmlChanged = existingHtml !== ((w as any).generated_html || "");
      const historyChanged = JSON.stringify(existingHistory) !== JSON.stringify(rawHistory);
      if (htmlChanged || historyChanged) {
        await updateWebsite(w.id, {
          generated_html: existingHtml,
          chat_history: existingHistory,
        } as any);
      }

      const isFresh = searchParams.get("fresh") === "1";
      if (isFresh && !didAutoRunRef.current && !existingHtml && existingHistory.length === 0 && w.config?.prompt) {
        didAutoRunRef.current = true;
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

  const persist = async (newHtml: string, newHistory: ChatMsg[], silent = false) => {
    if (!website) return;
    if (!silent) setSaveState("saving");
    try {
      await updateWebsite(website.id, {
        generated_html: newHtml,
        chat_history: newHistory,
      } as any);
      setSaveState("saved");
    } catch {
      setSaveState("unsaved");
    }
  };

  const saveNow = async () => {
    if (!html || !website) return;
    await persist(html, history);
    toast({ title: "Guardado!", description: "O teu site foi guardado com sucesso." });
  };

  useEffect(() => {
    if (!html || !website || loading) return;
    setSaveState("unsaved");
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      await persist(html, history, true);
    }, 3000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

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
      const safeHtml = normalizeGeneratedHtml(data.html);
      const asst: ChatMsg = {
        role: "assistant",
        content: "Site criado ✨ Pede qualquer alteração — cores, secções, logo, links, equipa, contactos, ou pede para transformar em site multi-página (com rotas /sobre, /serviços, etc).",
        ts: Date.now(),
        action: "edit",
        htmlSnapshot: safeHtml,
      };
      const finalHistory = [...draftHistory, asst];
      setHtml(safeHtml);
      setHistory(finalHistory);
      await persist(safeHtml, finalHistory);
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
    setBusyLabel(mode === "plan" ? "A elaborar plano..." : "A interpretar pedido");
    const userMsg: ChatMsg = { role: "user", content: finalText + (sentAttachments.length ? `  📎 ${sentAttachments.length}` : ""), ts: Date.now() };
    const liveAsst: ChatMsg = { role: "assistant", content: "", ts: Date.now(), action: "chat" };
    const draft = [...history, userMsg, liveAsst];
    setHistory(draft);
    const liveIdx = draft.length - 1;

    try {
      const data = await streamEdge(
        "edit-site-html",
        { html, instruction: finalText, history: draft.slice(-9, -1), mode, attachments: sentAttachments },
        ctrl.signal,
        (partial) => {
          if (!partial) return;
          setHistory((cur) => {
            const next = [...cur];
            if (next[liveIdx]?.role === "assistant") {
              next[liveIdx] = { ...next[liveIdx], content: partial };
            }
            return next;
          });
        },
        (phase) => setBusyLabel(phase),
      );

      const action = data.action;
      const newHtml = action === "edit" && data.html ? data.html : html;
      const didChangeHtml = action === "edit" && newHtml.replace(/\s+/g, " ").trim() !== html.replace(/\s+/g, " ").trim();
      const finalAction = didChangeHtml ? action : action === "edit" ? "chat" : action;
      const asst: ChatMsg = {
        role: "assistant",
        content: didChangeHtml
          ? (data.message || "Alteração aplicada.")
          : (data.message || "Não encontrei uma alteração concreta para aplicar ao site actual."),
        ts: Date.now(),
        action: finalAction,
        htmlSnapshot: didChangeHtml ? newHtml : undefined,
      };
      const final = [...draft.slice(0, liveIdx), asst];
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
      const final = [...draft.slice(0, liveIdx), asst];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#011612]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!website) return null;

  const deviceWidth = device === "mobile" ? 390 : device === "tablet" ? 768 : "100%";
  const elapsedLabel = busySeconds > 0 ? ` · ${busySeconds}s` : "";

  return (
    <div className="h-screen flex flex-col bg-[#011612] text-[#cfe8e1] font-sans antialiased overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="bg-[#021713]/80 backdrop-blur-xl border-b border-[#095344]/30 shadow-sm shadow-[#45fd94]/5 flex justify-between items-center w-full px-6 h-16 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/websites")} className="hover:bg-white/5 text-[#45fd94]" title="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-[#095344]/30"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#182e29] border border-[#095344]/20 text-[#aacbc4] text-xs">
            <Globe className="h-3.5 w-3.5 text-[#45fd94]" />
            <span>{website.name || "portfolio.aether"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0d231f] rounded-lg p-1 mr-2 border border-[#095344]/20">
            <Button size="sm" variant={device === "desktop" ? "default" : "ghost"} className={cn("h-7 px-2.5 rounded-md text-[#aacbc4]", device === "desktop" && "bg-[#45fd94] text-[#011612]")} onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
            <Button size="sm" variant={device === "tablet" ? "default" : "ghost"} className={cn("h-7 px-2.5 rounded-md text-[#aacbc4]", device === "tablet" && "bg-[#45fd94] text-[#011612]")} onClick={() => setDevice("tablet")}><Tablet className="h-4 w-4" /></Button>
            <Button size="sm" variant={device === "mobile" ? "default" : "ghost"} className={cn("h-7 px-2.5 rounded-md text-[#aacbc4]", device === "mobile" && "bg-[#45fd94] text-[#011612]")} onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#095344]/50 hover:bg-[#095344]/20 text-[#cfe8e1]" disabled={versions.length === 0} title="Histórico de versões">
                <HistoryIcon className="h-4 w-4 mr-1.5" />
                Histórico
                {versions.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-[#45fd94]/20 text-[#45fd94] text-[10px] font-semibold">
                    {versions.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 bg-[#021f1b] border-[#095344]/40 text-[#cfe8e1]">
              <div className="px-4 py-3 border-b border-[#095344]/20 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Histórico de versões</p>
                  <p className="text-[11px] text-[#aacbc4]">{versions.length} guardada{versions.length === 1 ? "" : "s"} · clica para reverter</p>
                </div>
                <HistoryIcon className="h-4 w-4 text-[#aacbc4]" />
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                {versions.map(({ message, index }, versionIndex) => {
                  const date = new Date(message.ts);
                  return (
                    <button
                      key={`${message.ts}-${index}`}
                      onClick={() => revertTo(message.htmlSnapshot!, index)}
                      className="group w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition"
                    >
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-[#45fd94]/10 text-[#45fd94] text-xs font-semibold flex items-center justify-center shrink-0">
                        v{versions.length - versionIndex}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-medium text-white">Versão {versions.length - versionIndex}</span>
                        </div>
                        <p className="text-[11px] text-[#aacbc4] line-clamp-2">{message.content}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="border-[#095344]/50 hover:bg-[#095344]/20 text-[#cfe8e1]" onClick={downloadHtml} disabled={!html}>
            <Download className="h-4 w-4 mr-1.5" />Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveNow}
            disabled={!html || saveState === "saving"}
            className={cn(
              "transition-colors border-[#095344]/50 hover:bg-[#095344]/20",
              saveState === "saved" && "border-green-500/40 text-green-400",
              saveState === "unsaved" && "border-amber-500/40 text-amber-400"
            )}
          >
            {saveState === "saving" ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : saveState === "saved" ? (
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-400 mr-1.5 inline-block animate-pulse" />
            )}
            {saveState === "saving" ? "A guardar…" : saveState === "saved" ? "Guardado" : "Guardar"}
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishOpen(true)}
            disabled={!html}
            className="bg-[#45fd94] hover:bg-[#30a684] text-[#011612] font-bold"
          >
            <Globe className="h-4 w-4 mr-1.5" />Publicar
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Layers / Page Sections */}
        <aside className="w-64 bg-[#021f1b]/60 backdrop-blur-xl border-r border-[#095344]/30 flex flex-col shrink-0 z-30">
          <div className="p-4 border-b border-[#095344]/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider text-[#aacbc4] uppercase">Pages & Layers</span>
              <button className="text-[#45fd94] hover:bg-[#45fd94]/10 p-1 rounded transition-colors">
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-2 p-1 bg-[#0d231f] rounded-lg border border-[#095344]/20">
              <button className="flex-1 py-1.5 rounded-md text-xs font-bold bg-[#45fd94] text-[#011612]">Layers</button>
              <button className="flex-1 py-1.5 rounded-md text-xs font-medium text-[#aacbc4] hover:text-white">Assets</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-[#aacbc4] text-xs font-bold tracking-widest uppercase opacity-60">
                <Layers className="h-3.5 w-3.5" />
                Global Elements
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#45fd94]/10 text-[#45fd94] border-l-4 border-l-[#45fd94] text-xs font-medium">
                  <Layout className="h-4 w-4" />
                  Header Navigation
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-[#aacbc4] text-xs font-bold tracking-widest uppercase opacity-60">
                <Grid className="h-3.5 w-3.5" />
                Page Sections
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { name: "Hero Section", icon: Layout },
                  { name: "Core Ecosystem", icon: Grid },
                  { name: "Capacity / Pricing", icon: CreditCard },
                  { name: "CTA / Footer Section", icon: Mail }
                ].map((sec, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-white/90 text-xs transition-all cursor-pointer">
                    <div className="flex items-center gap-2">
                      <sec.icon className="h-4 w-4 text-[#aacbc4]" />
                      <span>{sec.name}</span>
                    </div>
                    <Eye className="h-3.5 w-3.5 text-[#aacbc4]/40 hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#095344]/20 bg-[#00110e]/40">
            <div className="flex items-center gap-2 text-xs text-[#45fd94] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#45fd94] opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45fd94]"></span>
              </span>
              AI Sync Active
            </div>
          </div>
        </aside>

        {/* Middle Canvas */}
        <main className="flex-1 bg-[#011612] relative overflow-hidden flex flex-col items-center justify-center p-8 z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(69,253,148,0.05),transparent_70%)] pointer-events-none" />
          
          {/* Zoom controls */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 bg-[#021f1b]/80 border border-[#095344]/30 px-4 py-2 rounded-full text-xs font-bold text-[#aacbc4] backdrop-blur-md">
            <span>{zoom}%</span>
            <div className="w-px h-3 bg-[#095344]/30"></div>
            <button className="hover:text-[#45fd94] cursor-pointer text-sm px-1" onClick={() => setZoom(z => Math.max(50, z - 10))}>-</button>
            <button className="hover:text-[#45fd94] cursor-pointer text-sm px-1" onClick={() => setZoom(z => Math.min(150, z + 10))}>+</button>
          </div>

          {html ? (
            <div 
              className="bg-background shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-[#095344]/30 rounded-2xl overflow-hidden transition-all duration-300 w-full"
              style={{ 
                width: deviceWidth, 
                maxWidth: "100%", 
                height: "calc(100vh - 10rem)",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center center"
              }}
            >
              {/* Fake web URL header */}
              <div className="h-10 bg-[#021713] border-b border-[#095344]/20 flex items-center px-4 justify-between text-xs text-[#aacbc4]/60">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="bg-[#081f1b] border border-[#095344]/20 rounded px-6 py-0.5 text-[10px]">
                  {website.slug ? `${website.slug}.kinja.ai` : "preview.kinja.ai"}
                </div>
                <div className="w-10"></div>
              </div>
              <SmoothPreviewIframe html={injectRuntime(html)} device={device} />
            </div>
          ) : (
            <div className="text-center text-[#aacbc4] z-10">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#45fd94] opacity-50" />
              <p className="text-sm">Escreva um pedido no chat para começar a gerar o seu site.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar: Assistant Chat / AI Copilot */}
        <aside 
          className={cn(
            "border-l border-[#095344]/30 flex flex-col min-h-0 bg-[#021f1b]/60 backdrop-blur-xl z-20 transition-all duration-300 shrink-0",
            isSidebarOpen ? "w-80" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="p-4 border-b border-[#095344]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#45fd94]/20 flex items-center justify-center text-[#45fd94]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white">Aether Copilot</h3>
              <p className="text-[9px] text-[#5ddcb1] uppercase tracking-wider font-bold">AI sync online</p>
            </div>
            <button className="ml-auto text-[#aacbc4] hover:text-[#45fd94]">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {busy && (
            <div className="px-4 py-2 bg-[#095344]/10 border-b border-[#095344]/20 flex items-center justify-between gap-2">
              <ThinkingIndicator label={busyLabel || undefined} elapsed={elapsedLabel} />
              <Button size="sm" variant="ghost" className="h-7 text-xs text-[#aacbc4] hover:text-red-400" onClick={stop}>
                Pausar
              </Button>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-w-0">
            {history.length === 0 && !busy && (
              <div className="text-xs text-[#aacbc4]/80 space-y-2">
                <p>Olá! Peça modificações visuais, novos blocos ou altere textos do site.</p>
                <div className="bg-[#081f1b] border border-[#095344]/20 rounded-xl p-3 space-y-1 text-[11px]">
                  <p className="font-semibold text-[#45fd94]">Exemplos:</p>
                  <p>• "Mude o título principal para 'Design Autônomo'"</p>
                  <p>• "Altere o fundo para um cinza escuro"</p>
                  <p>• "Adicione uma seção de contato antes do rodapé"</p>
                </div>
              </div>
            )}

            {history.map((m, i) => {
              const isError = m.role === "assistant" && m.content.startsWith("⚠️");
              return (
                <div key={i} className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "rounded-xl p-3 text-xs leading-relaxed max-w-[90%] shadow-md border",
                    m.role === "user" 
                      ? "bg-[#45fd94]/10 border-[#45fd94]/30 text-white" 
                      : "bg-[#081f1b]/80 border-[#095344]/30 text-[#cfe8e1]",
                    isError && "bg-red-500/10 border-red-500/30 text-red-300"
                  )}>
                    <p>{m.content}</p>
                    {m.role === "assistant" && m.action === "edit" && m.htmlSnapshot && (
                      <div className="mt-2 pt-2 border-t border-[#095344]/20 flex justify-between items-center text-[10px]">
                        <button onClick={() => revertTo(m.htmlSnapshot!, i)} className="text-[#45fd94] hover:underline flex items-center gap-1 font-bold">
                          <Undo2 className="h-3 w-3" /> Reverter versão
                        </button>
                        <span className="text-[9px] uppercase tracking-wider text-[#aacbc4]/50">Aplicado</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggestions */}
          <div className="p-3 bg-[#00110e]/40 border-t border-[#095344]/20 space-y-1.5">
            <span className="text-[9px] font-bold text-[#aacbc4] block mb-1">SUGGESTIONS</span>
            {["Optimize for mobile design", "Apply high-contrast layout", "Add contact form"].map((s, idx) => (
              <button 
                key={idx} 
                onClick={() => setInput(s)}
                disabled={busy}
                className="w-full text-left p-1.5 rounded bg-[#081f1b] border border-[#095344]/20 hover:border-[#45fd94]/40 hover:bg-[#45fd94]/5 text-[10px] text-[#aacbc4] hover:text-white transition-all truncate disabled:opacity-40 disabled:cursor-not-allowed"
              >
                "{s}"
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-[#095344]/20">
            <div className="relative group">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy) send(); } }}
                disabled={busy}
                placeholder={busy ? "Aguarde que a alteração seja concluída..." : "Type a command (e.g. 'Add a pricing card')..."}
                className="w-full bg-[#081f1b] border border-[#095344]/20 focus:border-[#45fd94] text-xs text-white placeholder:text-[#aacbc4]/40 rounded-xl p-3 resize-none h-20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={send}
                disabled={busy || (!input.trim() && attachments.length === 0)}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-[#45fd94] hover:bg-[#30a684] text-[#011612] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <button onClick={toggleRecord} disabled={busy} className={cn("text-[#aacbc4] hover:text-[#45fd94] disabled:opacity-40 disabled:cursor-not-allowed", recording && "text-red-500")}><Mic className="h-4 w-4" /></button>
                <button disabled={busy} className="text-[#aacbc4] hover:text-[#45fd94] disabled:opacity-40 disabled:cursor-not-allowed"><Paperclip className="h-4 w-4" /></button>
              </div>
              <span className="text-[9px] text-[#aacbc4]/40">⌘ + Enter to send</span>
            </div>
          </div>
        </aside>
      </div>

      {website && (
        <PublishDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          websiteId={website.id}
          currentSlug={(website as any).slug ?? null}
          onPublished={({ slug, published_url }) =>
            setWebsite({ ...website, status: "active", published_url, ...(slug !== undefined ? { slug } : {}) } as Website)
          }
        />
      )}
    </div>
  );
}
