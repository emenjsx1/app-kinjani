import { Bot, User, FileText, AudioLines } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type BubbleAttachment = { type: string; name: string; dataUrl: string };

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  isLoading?: boolean;
  /** Optional reasoning/phase shown while waiting for first token */
  phase?: string;
  attachments?: BubbleAttachment[];
  className?: string;
}

export function ChatBubble({
  message,
  isUser = false,
  timestamp,
  isLoading = false,
  phase,
  attachments,
  className,
}: ChatBubbleProps) {
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] animate-fade-in",
        isUser ? "ml-auto flex-row-reverse" : "",
        className,
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 min-w-0",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm",
        )}
      >
        {hasAttachments && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachments!.map((a, i) =>
              a.type.startsWith("image/") ? (
                <img
                  key={i}
                  src={a.dataUrl}
                  alt={a.name}
                  className="h-24 w-24 rounded-md object-cover border border-black/10"
                />
              ) : a.type.startsWith("audio/") ? (
                <div key={i} className="flex items-center gap-2 rounded-md bg-background/40 px-2 py-1 text-xs">
                  <AudioLines className="h-3.5 w-3.5" />
                  <audio src={a.dataUrl} controls className="h-7" />
                </div>
              ) : (
                <a
                  key={i}
                  href={a.dataUrl}
                  download={a.name}
                  className="flex items-center gap-2 rounded-md bg-background/40 px-2 py-1 text-xs underline-offset-2 hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {a.name}
                </a>
              ),
            )}
          </div>
        )}

        {isLoading || (!message && phase) ? (
          <ThinkingRow label={phase || "A pensar"} />
        ) : (
          message && <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        )}

        {timestamp && (
          <span
            className={cn(
              "text-[10px] mt-1 block",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

function ThinkingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce" />
      </span>
      <span className="font-medium">{label}…</span>
    </div>
  );
}
