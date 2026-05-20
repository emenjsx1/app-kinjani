import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, Square, X, FileText, Image as ImageIcon, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type InputAttachment = { type: string; name: string; dataUrl: string; size?: number };

interface ChatInputProps {
  onSend: (message: string, attachments?: InputAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Enable file/audio attachments. Defaults to true. */
  multimodal?: boolean;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8MB per file
const MAX_FILES = 4;

const ACCEPT = "image/*,audio/*,application/pdf";

const fileToDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });

function attachmentIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5" />;
  if (type.startsWith("audio/")) return <AudioLines className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Escreve a tua mensagem…",
  className,
  multimodal = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<InputAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;
    onSend(message.trim() || (attachments.length ? "(ver anexos)" : ""), attachments.length ? attachments : undefined);
    setMessage("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, MAX_FILES);
    const out: InputAttachment[] = [];
    for (const f of arr) {
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} excede 8MB`);
        continue;
      }
      const dataUrl = await fileToDataUrl(f);
      out.push({ type: f.type || "application/octet-stream", name: f.name, dataUrl, size: f.size });
    }
    setAttachments((prev) => [...prev, ...out].slice(0, MAX_FILES));
  }, []);

  const onPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!multimodal) return;
      const items = Array.from(e.clipboardData?.items || []);
      const files = items.map((i) => i.getAsFile()).filter((f): f is File => !!f);
      if (files.length) {
        e.preventDefault();
        await handleFiles(files);
      }
    },
    [handleFiles, multimodal],
  );

  const toggleRecord = async () => {
    if (recording) {
      mediaRecRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recChunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size > 0 && recChunksRef.current.push(ev.data);
      rec.onstop = async () => {
        const blob = new Blob(recChunksRef.current, { type: rec.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result);
          setAttachments((prev) =>
            [
              ...prev,
              { type: blob.type, name: `voz-${new Date().toISOString().slice(11, 19)}.webm`, dataUrl, size: blob.size },
            ].slice(0, MAX_FILES),
          );
        };
        reader.readAsDataURL(blob);
      };
      mediaRecRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error("Não consegui aceder ao microfone");
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className={cn("border-t bg-background", className)}>
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2 py-1 text-xs">
              {att.type.startsWith("image/") ? (
                <img src={att.dataUrl} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <span className="inline-flex items-center justify-center h-8 w-8 rounded bg-muted text-muted-foreground">
                  {attachmentIcon(att.type)}
                </span>
              )}
              <span className="max-w-[140px] truncate">{att.name}</span>
              <button
                onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                className="ml-1 rounded p-0.5 hover:bg-background"
                aria-label="Remover"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        {multimodal && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="shrink-0 h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Anexar imagem, áudio ou PDF"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant={recording ? "destructive" : "ghost"}
              size="icon"
              type="button"
              className="shrink-0 h-9 w-9"
              onClick={toggleRecord}
              disabled={disabled}
              title={recording ? "Parar gravação" : "Gravar voz"}
            >
              {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </>
        )}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder={recording ? "A gravar… clica em parar quando terminares." : placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="icon"
          className="shrink-0 h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
