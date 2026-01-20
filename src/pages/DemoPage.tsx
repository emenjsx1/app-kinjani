import { AppLayout } from "@/components/layout/AppLayout";
import { ChatContainer, Message } from "@/components/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Olá! Sou o KINJA AI, o seu assistente inteligente. Como posso ajudá-lo hoje?",
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Obrigado pela sua mensagem! Esta é uma resposta de demonstração. Num cenário real, esta resposta seria alimentada pelo seu agente IA configurado. Você disse: "${content}"`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AppLayout pageTitle="Demo" credits={1250}>
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="border-b">
            <CardTitle>Demo do Chat</CardTitle>
            <CardDescription>
              Teste o seu agente IA em tempo real. Esta é uma pré-visualização de como os seus utilizadores vão interagir com o seu agente.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Escreva uma mensagem para testar o agente..."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
