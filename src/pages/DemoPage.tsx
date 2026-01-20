import { AppLayout } from "@/components/layout/AppLayout";
import { ChatContainer, Message } from "@/components/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm KINJA AI, your intelligent assistant. How can I help you today?",
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thanks for your message! This is a demo response. In a real scenario, this would be powered by your configured AI agent. You said: "${content}"`,
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
            <CardTitle>Chat Demo</CardTitle>
            <CardDescription>
              Test your AI agent in real-time. This is a preview of how your users will interact with your agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Type a message to test the agent..."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
