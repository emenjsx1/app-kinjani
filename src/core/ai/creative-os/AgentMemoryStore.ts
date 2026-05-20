import type { AgentMemory, CreativeAgentId } from "./types";

const empty = (): AgentMemory => ({
  shortTerm: [],
  project: [],
  visual: [],
  style: [],
  operations: [],
});

class AgentMemoryStore {
  private store = new Map<CreativeAgentId, AgentMemory>();

  get(id: CreativeAgentId): AgentMemory {
    let m = this.store.get(id);
    if (!m) {
      m = empty();
      this.store.set(id, m);
    }
    return m;
  }

  remember(
    id: CreativeAgentId,
    bucket: keyof AgentMemory,
    entry: string,
    cap = 50,
  ) {
    const m = this.get(id);
    m[bucket] = [entry, ...m[bucket]].slice(0, cap);
  }

  reset(id?: CreativeAgentId) {
    if (id) this.store.delete(id);
    else this.store.clear();
  }
}

export const agentMemoryStore = new AgentMemoryStore();
