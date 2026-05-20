import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThinkingIndicatorProps {
  /** Optional explicit label from the caller (overrides rotation). */
  label?: string;
  /** Optional elapsed time suffix, e.g. " · 4s". */
  elapsed?: string;
  className?: string;
}

const PHASES = [
  "A interpretar pedido",
  "A consultar contexto",
  "A desenhar a solução",
  "A escrever código",
  "A aplicar alterações",
  "A polir detalhes",
];

/**
 * Cinematic "thinking" indicator: shimmer text + slowly rotating phase
 * verbs so users feel real reasoning instead of a static "loading...".
 */
export function ThinkingIndicator({ label, elapsed, className }: ThinkingIndicatorProps) {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (label) return; // caller is driving the label
    const id = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [label]);

  const text = label || PHASES[phaseIdx];

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span
        key={text}
        className="bg-[linear-gradient(110deg,hsl(var(--muted-foreground))_45%,hsl(var(--foreground))_55%,hsl(var(--muted-foreground))_65%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer animate-fade-in"
      >
        {text}
        <span className="inline-block ml-0.5 animate-pulse">…</span>
      </span>
      {elapsed && (
        <span className="text-[11px] text-muted-foreground/70 tabular-nums">{elapsed}</span>
      )}
    </div>
  );
}
