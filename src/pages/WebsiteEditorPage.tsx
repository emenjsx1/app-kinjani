import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Globe, ExternalLink, Loader2, Sparkles, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/hooks/use-toast";
import { useWebsites, Website } from "@/hooks/useWebsites";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

type ChatMsg = { role: "user" | "assistant"; content: string; ts: number };

export default function WebsiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWebsite, updateWebsite } = useWebsites();
  const [website, setWebsite] = useState<Website | null>(null);
  const [html, setHtml] = useState<string>("");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      if (!id) return navigate("/websites");
      const w = await getWebsite(id);
      if (!w) return navigate("/websites");
      setWebsite(w);
      setHtml((w as any).generated_html || "");
      setHistory(Array.isArray((w as any).chat_history) ? (w as any).chat_history : []);
      setLoading(false);

      // Auto-generate if empty and there's a prompt
      if (!(w as any).generated_html && w.config?.prompt) {
        runGenerate(w.config.prompt, w.name);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [history, busy]);

  const persist = async (newHtml: string, newHistory: ChatMsg[]) => {
    if (!website) return;
    await updateWebsite(website.id, {
      generated_html: newHtml,
      chat_history: newHistory,
    } as any);
  };

  const runGenerate = async (prompt: string, name?: string) => {
    setBusy(true);
    setBusyLabel("A criar o teu site...");
    const userMsg: ChatMsg = { role: "user", content: prompt, ts: Date.now() };
    const draftHistory = [...history, userMsg];
    setHistory(draftHistory);
    try {
      const { data, error } = await supabase.functions.invoke("generate-site-html", {
        body: { prompt, websiteName: name || website?.name },
      });
      if (error || !data?.html) throw new Error(error?.message || data?.error || "Falha");
      const asst: ChatMsg = { role: "assistant", content: "Site criado. Pede qualquer alteração — cores, secções, logo, links, botões...", ts: Date.now() };
      const finalHistory = [...draftHistory, asst];
      setHtml(data.html);
      setHistory(finalHistory);
      await persist(data.html, finalHistory);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao gerar.", variant: "destructive" });
      setHistory(history);
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    if (!html) {
      // first generation
      await runGenerate(text, website?.name);
      return;
    }

    setBusy(true);
    setBusyLabel("A aplicar alteração...");
    const userMsg: ChatMsg = { role: "user", content: text, ts: Date.now() };
    const draft = [...history, userMsg];
    setHistory(draft);
    try {
      const { data, error } = await supabase.functions.invoke("edit-site-html", {
        body: { html, instruction: text, history: draft.slice(-8) },
      });
      if (error || !data?.html) throw new Error(error?.message || data?.error || "Falha");
      const asst: ChatMsg = { role: "assistant", content: data.message || "Pronto!", ts: Date.now() };
      const final = [...draft, asst];
      setHtml(data.html);
      setHistory(final);
      await persist(data.html, final);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha.", variant: "destructive" });
      setHistory(history);
    } finally {
      setBusy(false);
      setBusyLabel("");
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 && !busy && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Olá! Descreve o site que queres ou peça uma alteração.</p>
                <p className="text-xs">Exemplos:<br/>• "Cria um site de psicologia, calmo, com booking"<br/>• "Adiciona uma secção de testemunhos"<br/>• "Muda a cor principal para verde-escuro"<br/>• "Coloca botão 'WhatsApp' que abre wa.me/258840000000"</p>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]"
                  : "text-sm text-foreground max-w-[95%] whitespace-pre-wrap"
                }>{m.content}</div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{busyLabel || "A pensar..."}</span>
              </div>
            )}
          </div>
          <div className="p-3 border-t">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={html ? "Descreve a alteração..." : "Descreve o site que queres criar..."}
                className="min-h-[80px] pr-12 resize-none"
                disabled={busy}
              />
              <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8" onClick={send} disabled={busy || !input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center p-6">
          {html ? (
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all" style={{ width: deviceWidth, maxWidth: "100%", height: "calc(100vh - 7rem)" }}>
              <iframe srcDoc={html} title="preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
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
