import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { agentBus } from "@/core/ai/creative-os";
import type { AgentMessage, CreativeAgentId } from "@/core/ai/creative-os";
import { cn } from "@/lib/utils";

const AGENT_META: Record<CreativeAgentId, { label: string; tone: string }> = {
  "creative-director": { label: "Creative Director", tone: "text-primary" },
  layout: { label: "Layout", tone: "text-blue-500" },
  "art-direction": { label: "Art Direction", tone: "text-fuchsia-500" },
  typography: { label: "Typography", tone: "text-amber-500" },
  color: { label: "Color", tone: "text-emerald-500" },
  ux: { label: "UX", tone: "text-cyan-500" },
  motion: { label: "Motion", tone: "text-violet-500" },
  responsive: { label: "Responsive", tone: "text-sky-500" },
  copy: { label: "Copy", tone: "text-rose-500" },
  brand: { label: "Brand", tone: "text-orange-500" },
  "runtime-fix": { label: "Runtime Fix", tone: "text-red-500" },
};

const KIND_DOT: Record<AgentMessage["kind"], string> = {
  status: "bg-muted-foreground",
  critique: "bg-amber-500",
  refinement: "bg-blue-500",
  handoff: "bg-violet-500",
  decision: "bg-emerald-500",
  error: "bg-red-500",
};

interface Props {
  className?: string;
  limit?: number;
}

/**
 * Live visualization of the multi-agent creative studio.
 * Subscribes to the AgentCommunicationBus and shows agents working in real time.
 */
export function AgentActivityPanel({ className, limit = 30 }: Props) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => agentBus.history());

  useEffect(() => {
    return agentBus.subscribe((m) => {
      setMessages((prev) => [...prev, m].slice(-limit));
    });
  }, [limit]);

  return (
    <div
      className={cn(
        "glass rounded-2xl border border-border/50 p-4 flex flex-col gap-2 max-h-[420px] overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-sm font-semibold tracking-tight">Estúdio AI ao vivo</h3>
        </div>
        <span className="text-xs text-muted-foreground">{messages.length} eventos</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const meta = AGENT_META[m.from];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-2 text-xs"
              >
                <span
                  className={cn(
                    "mt-1.5 inline-block h-1.5 w-1.5 rounded-full shrink-0",
                    KIND_DOT[m.kind],
                  )}
                />
                <span className={cn("font-medium shrink-0", meta?.tone)}>
                  {meta?.label ?? m.from}
                </span>
                <span className="text-muted-foreground leading-relaxed">{m.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!messages.length && (
          <p className="text-xs text-muted-foreground italic">
            Aguardando direção criativa…
          </p>
        )}
      </div>
    </div>
  );
}

export default AgentActivityPanel;
