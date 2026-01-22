import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { WebsiteTemplate } from "@/lib/website-templates";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface EditorAIChatProps {
  template: WebsiteTemplate;
  websiteName: string;
  onTemplateUpdate: (template: WebsiteTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function EditorAIChat({ template, websiteName, onTemplateUpdate, isOpen, onClose }: EditorAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá! Sou o assistente de edição. Pode pedir-me alterações como:\n• "Muda a cor principal para azul"\n• "Altera o título do hero"\n\nO que gostaria de alterar?`,
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile, deductCredits } = useProfile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    if (!profile || profile.credits_balance < 1) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Sem créditos suficientes." }]);
      setIsLoading(false);
      return;
    }

    await deductCredits(1, "ai_website_edit", "Edição de site com IA");

    try {
      const { data, error } = await supabase.functions.invoke("ai-edit-website", {
        body: { instruction: userMessage.content, template, websiteName },
      });

      if (error || !data?.success) throw new Error(data?.error || "Erro");

      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: data.message || "Alteração aplicada!" }]);
      if (data.template) {
        onTemplateUpdate(data.template);
        toast.success("Alteração aplicada!");
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Erro ao processar. Tente novamente." }]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card border rounded-xl shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Assistente IA</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{profile?.credits_balance ?? 0} créditos</Badge>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn("rounded-lg px-4 py-2 max-w-[85%]", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Bot className="w-4 h-4" /></div>
              <div className="bg-muted rounded-lg px-4 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ex: Muda a cor para verde..."
          disabled={isLoading}
        />
        <Button size="icon" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
