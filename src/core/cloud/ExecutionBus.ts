/**
 * Phase H — Execution event bus.
 * Real pub/sub for runtime, deploy, migration, auth, API and workflow events.
 * Bridges into the Creative OS AgentCommunicationBus so the existing
 * AgentActivityPanel and SoftwareTimeline can react in real time.
 */

import type { ExecutionEvent, ExecutionEventKind, ExecutionLevel } from "./types";
import { agentBus, makeMessage } from "@/core/ai/creative-os/AgentCommunicationBus";

type Listener = (e: ExecutionEvent) => void;

class ExecutionBus {
  private listeners = new Set<Listener>();
  private buffer: ExecutionEvent[] = [];
  private cap = 500;
  private seq = 0;

  publish(partial: Omit<ExecutionEvent, "id" | "ts">) {
    const event: ExecutionEvent = {
      id: `exec_${Date.now()}_${++this.seq}`,
      ts: Date.now(),
      ...partial,
    };
    this.buffer = [...this.buffer, event].slice(-this.cap);
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch {
        /* ignore */
      }
    });

    // Mirror critical events into the creative-os bus so existing UIs surface them.
    if (event.level === "error" || event.kind.startsWith("deploy") || event.kind.startsWith("migration")) {
      agentBus.publish(
        makeMessage("devops" as never, {
          kind: "status",
          severity: event.level === "error" ? "error" : "info",
          text: `[${event.kind}] ${event.message}`,
        } as never),
      );
    }
    return event;
  }

  log(source: string, message: string, level: ExecutionLevel = "info", data?: Record<string, unknown>) {
    return this.publish({ kind: "log", source, message, level, data });
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  history(filter?: { kind?: ExecutionEventKind; source?: string }): ExecutionEvent[] {
    if (!filter) return [...this.buffer];
    return this.buffer.filter(
      (e) =>
        (!filter.kind || e.kind === filter.kind) &&
        (!filter.source || e.source === filter.source),
    );
  }

  clear() {
    this.buffer = [];
  }
}

export const executionBus = new ExecutionBus();
