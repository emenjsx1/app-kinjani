import { useState, useCallback, useRef } from "react";

export type ChatAttachment = {
  type: string;
  name: string;
  dataUrl: string;
  /** preview-only original size in bytes */
  size?: number;
};

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  attachments?: ChatAttachment[];
  /** assistant-only: short phase label shown while we wait for first token */
  phase?: string;
}

interface UseAgentChatOptions {
  agentType: string;
  agentPrompt: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

const nowLabel = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const phaseFromAttachments = (atts: ChatAttachment[] | undefined): string => {
  if (!atts || atts.length === 0) return "A pensar";
  const hasImg = atts.some((a) => a.type.startsWith("image/"));
  const hasAudio = atts.some((a) => a.type.startsWith("audio/"));
  const hasPdf = atts.some((a) => a.type === "application/pdf");
  const bits: string[] = [];
  if (hasAudio) bits.push("a ouvir áudio");
  if (hasImg) bits.push("a analisar imagem");
  if (hasPdf) bits.push("a ler documento");
  return bits.length ? `A processar (${bits.join(", ")})` : "A pensar";
};

export function useAgentChat({ agentType, agentPrompt }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Olá! Sou o seu assistente IA. Pode enviar texto, imagens, áudios ou PDFs.",
      isUser: false,
      timestamp: nowLabel(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const sendMessage = useCallback(
    async (content: string, attachments?: ChatAttachment[]) => {
      setError(null);

      const userMessage: Message = {
        id: `${Date.now()}-u`,
        content,
        isUser: true,
        timestamp: nowLabel(),
        attachments,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const assistantId = `${Date.now() + 1}-a`;
      const initialPhase = phaseFromAttachments(attachments);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, content: "", isUser: false, timestamp: nowLabel(), phase: initialPhase },
      ]);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        // History excludes welcome + the just-added empty assistant message
        const chatHistory = messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.isUser ? ("user" as const) : ("assistant" as const), content: m.content }));

        const response = await fetch(CHAT_URL, {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...chatHistory, { role: "user", content }],
            agentType,
            agentPrompt,
            attachments,
          }),
        });

        if (!response.ok || !response.body) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";
        let firstToken = true;
        let streamDone = false;

        const applyDelta = (delta: string) => {
          if (!delta) return;
          assistantContent += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: assistantContent, phase: firstToken ? undefined : m.phase }
                : m,
            ),
          );
          firstToken = false;
        };

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (deltaContent) applyDelta(deltaContent);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (err) {
        const aborted = (err as any)?.name === "AbortError";
        const errorMessage = aborted
          ? "Parado pelo utilizador."
          : err instanceof Error
          ? err.message
          : "Erro ao enviar mensagem";
        setError(aborted ? null : errorMessage);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || (aborted ? "_Parado._" : `Desculpe, ocorreu um erro: ${errorMessage}`),
                  phase: undefined,
                }
              : m,
          ),
        );
      } finally {
        abortRef.current = null;
        setIsLoading(false);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, phase: undefined } : m)));
      }
    },
    [messages, agentType, agentPrompt],
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        content: "Olá! Sou o seu assistente IA. Pode enviar texto, imagens, áudios ou PDFs.",
        isUser: false,
        timestamp: nowLabel(),
      },
    ]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, stop };
}
