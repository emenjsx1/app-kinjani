import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  placeholder,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          {isLoading && <ChatBubble message="" isUser={false} isLoading />}
        </div>
      </ScrollArea>
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder={placeholder}
      />
    </div>
  );
}
