import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  isLoading?: boolean;
  className?: string;
}

export function ChatBubble({
  message,
  isUser = false,
  timestamp,
  isLoading = false,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "",
        className
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {isLoading ? (
          <TypingIndicator />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        )}
        {timestamp && (
          <span
            className={cn(
              "text-[10px] mt-1 block",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce" />
    </div>
  );
}
