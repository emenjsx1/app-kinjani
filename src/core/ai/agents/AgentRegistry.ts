import type { Agent, AgentId, AgentRunInput, AgentRunResult } from "./types";

class AgentRegistry {
  private agents = new Map<AgentId, Agent>();

  register(agent: Agent) {
    this.agents.set(agent.id, agent);
  }
  get(id: AgentId) {
    return this.agents.get(id);
  }
  all() {
    return Array.from(this.agents.values());
  }

  /** Route a prompt to the first agent whose canHandle returns true. */
  route(input: AgentRunInput): Agent | undefined {
    for (const a of this.agents.values()) {
      if (a.canHandle?.(input)) return a;
    }
    return this.agents.get("planner");
  }

  /** Run an agent chain starting from `start` until no nextAgent is returned. */
  async runChain(start: AgentId, input: AgentRunInput): Promise<AgentRunResult[]> {
    const results: AgentRunResult[] = [];
    let next: AgentId | undefined = start;
    let hints = input.hints;
    let safety = 0;
    while (next && safety++ < 6) {
      const agent = this.agents.get(next);
      if (!agent) break;
      const res = await agent.run({ ...input, hints });
      results.push(res);
      hints = { ...(hints ?? {}), [next]: res.data };
      next = res.nextAgent;
    }
    return results;
  }
}

export const agentRegistry = new AgentRegistry();
