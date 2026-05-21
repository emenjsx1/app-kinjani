import { useState } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatContainer, Message } from "./ChatContainer";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  agentName?: string;
  welcomeMessage?: string;
  className?: string;
}

export function ChatWidget({
  agentName = "KINJA AI",
  welcomeMessage = "Hello! How can I help you today?",
  className,
}: ChatWidgetProps) {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string, _attachments?: { type: string; name: string; dataUrl: string; size?: number }[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a demo response to: "${content}"`,
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

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {isOpen ? (
        <Card className="w-[85vw] max-w-[380px] h-[70vh] max-h-[500px] flex flex-col shadow-2xl overflow-hidden text-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">{agentName}</h3>
                <p className="text-[10px] text-primary-foreground/70">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
                aria-label="Minimizar"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Chat */}
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            className="flex-1"
          />

          {/* Footer */}
          <div className="px-3 py-1.5 border-t bg-muted/30">
            <p className="text-[10px] text-center text-muted-foreground">
              Powered by <span className="font-semibold">KINJA AI</span>
            </p>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

      )}
    </div>
  );
}
