import type { AITool, AIToolRegistry } from "./types";

class InMemoryToolRegistry implements AIToolRegistry {
  private tools = new Map<string, AITool>();
  register<T>(tool: AITool<T>) {
    this.tools.set(tool.id, tool as AITool);
  }
  get(id: string) {
    return this.tools.get(id);
  }
  all() {
    return Array.from(this.tools.values());
  }
}

export const aiToolRegistry: AIToolRegistry = new InMemoryToolRegistry();
