import type { AgentMessage } from "./types";

type Listener = (msg: AgentMessage) => void;

class AgentCommunicationBus {
  private listeners = new Set<Listener>();
  private buffer: AgentMessage[] = [];
  private cap = 200;

  publish(msg: AgentMessage) {
    this.buffer = [...this.buffer, msg].slice(-this.cap);
    this.listeners.forEach((l) => {
      try {
        l(msg);
      } catch {
        /* ignore */
      }
    });
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  history(): AgentMessage[] {
    return [...this.buffer];
  }

  clear() {
    this.buffer = [];
  }
}

export const agentBus = new AgentCommunicationBus();

let counter = 0;
export function makeMessage(
  from: AgentMessage["from"],
  partial: Omit<AgentMessage, "id" | "ts" | "from">,
): AgentMessage {
  return {
    id: `msg_${Date.now()}_${++counter}`,
    ts: Date.now(),
    from,
    ...partial,
  };
}
