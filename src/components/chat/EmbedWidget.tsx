import { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface EmbedWidgetProps {
  agentId: string;
  agentName?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

// Componente standalone para incorporar em sites externos
export function EmbedWidget({
  agentId,
  agentName = "Assistente KINJA",
  primaryColor = "hsl(152, 100%, 44%)",
  welcomeMessage = "Olá! Como posso ajudá-lo hoje?",
  position = "bottom-right",
  className,
}: EmbedWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: welcomeMessage,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular resposta (em produção, isto chamaria a API real)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Obrigado pela sua mensagem! Esta é uma resposta de demonstração. Em produção, a resposta seria gerada pelo agente "${agentName}".`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const positionClasses = position === "bottom-right" 
    ? "bottom-4 right-4" 
    : "bottom-4 left-4";

  return (
    <div className={cn("fixed z-[9999]", positionClasses, className)}>
      {isOpen ? (
        <Card 
          className="w-[380px] h-[520px] flex flex-col shadow-2xl overflow-hidden border-0"
          style={{ 
            "--widget-primary": primaryColor,
          } as React.CSSProperties}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{agentName}</h3>
                <p className="text-xs opacity-80">Online • Responde agora</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gray-50">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.isUser
                      ? "ml-auto bg-gray-800 text-white rounded-br-md"
                      : "mr-auto bg-white text-gray-800 rounded-bl-md shadow-sm border"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={cn(
                    "text-[10px] mt-1 block",
                    msg.isUser ? "text-gray-400" : "text-gray-400"
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 border-gray-200 focus-visible:ring-1"
                style={{ 
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isLoading}
                style={{ backgroundColor: primaryColor }}
                className="hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-[10px] text-center text-gray-400">
              Powered by <span className="font-semibold text-gray-600">KINJA AI</span>
            </p>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

// Código de embed para copiar
export function generateEmbedCode(agentId: string, agentName: string): string {
  return `<!-- KINJA AI Chat Widget -->
<script>
  (function() {
    var w = window;
    var d = document;
    var s = d.createElement('script');
    s.src = 'https://cdn.kinja.ai/widget.js';
    s.async = true;
    s.onload = function() {
      w.KinjaChat.init({
        agentId: '${agentId}',
        agentName: '${agentName}',
        primaryColor: '#00DF81',
        position: 'bottom-right'
      });
    };
    d.head.appendChild(s);
  })();
</script>
<!-- End KINJA AI Widget -->`;
}
