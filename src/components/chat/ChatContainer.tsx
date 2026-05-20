import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble, BubbleAttachment } from "./ChatBubble";
import { ChatInput, InputAttachment } from "./ChatInput";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  attachments?: BubbleAttachment[];
  phase?: string;
}

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string, attachments?: InputAttachment[]) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  multimodal?: boolean;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  placeholder,
  multimodal = true,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
              attachments={msg.attachments}
              phase={msg.phase}
            />
          ))}
        </div>
      </ScrollArea>
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder={placeholder}
        multimodal={multimodal}
      />
    </div>
  );
}
