import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function EmbedPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [params] = useSearchParams();
  const position = params.get("position") || "bottom-right";
  const primaryColor = params.get("color") || "#00DF81";

  const [isOpen, setIsOpen] = useState(false);
  const [agentName, setAgentName] = useState("Assistente IA");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentType, setAgentType] = useState("atendimento-faq");
  const [welcome, setWelcome] = useState("Olá! Como posso ajudá-lo hoje?");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Notify parent (widget.js) of open/close so it can resize the iframe
  useEffect(() => {
    window.parent?.postMessage(
      { source: "kinjani-widget", type: "resize", open: isOpen },
      "*"
    );
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  useEffect(() => {
    if (!agentId) return;
    (async () => {
      const { data } = await supabase
        .from("agents")
        .select("name,type,prompt")
        .eq("id", agentId)
        .maybeSingle();
      if (data) {
        setAgentName(data.name || "Assistente IA");
        setAgentType(data.type || "atendimento-faq");
        setAgentPrompt(data.prompt || "");
      }
      setMessages([
        { id: "welcome", content: welcome, isUser: false, timestamp: now() },
      ]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), content: input, isUser: true, timestamp: now() };
    setMessages((p) => [...p, userMsg]);
    const userText = input;
    setInput("");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-chat", {
        body: {
          messages: [...messages, userMsg].map((m) => ({
            role: m.isUser ? "user" : "assistant",
            content: m.content,
          })),
          agentType,
          agentPrompt,
        },
      });
      if (error) throw error;
      const reply = (data as any)?.reply || (data as any)?.message || "Desculpe, não consegui responder agora.";
      setMessages((p) => [...p, { id: Date.now().toString() + "r", content: reply, isUser: false, timestamp: now() }]);
    } catch (e) {
      setMessages((p) => [...p, { id: Date.now().toString() + "e", content: "Erro ao processar mensagem. Tente novamente.", isUser: false, timestamp: now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sideClass = position.includes("left") ? "left-3" : "right-3";

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-3", sideClass)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
          aria-label="Abrir chat"
        >
          <Bot className="h-7 w-7 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-3 w-[400px] h-[580px] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200", sideClass)}>
      <div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{agentName}</h3>
            <p className="text-xs opacity-80">Online • Responde agora</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              m.isUser ? "ml-auto bg-gray-800 text-white rounded-br-md" : "mr-auto bg-white text-gray-800 rounded-bl-md shadow-sm border")}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              <span className="text-[10px] mt-1 block text-gray-400">{m.timestamp}</span>
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t bg-white flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva uma mensagem..." disabled={isLoading} className="flex-1" />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} style={{ backgroundColor: primaryColor }}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="px-4 py-2 border-t bg-gray-50">
        <p className="text-[10px] text-center text-gray-400">Powered by <span className="font-semibold text-gray-600">Kinjani AI</span></p>
      </div>
    </div>
  );
}
