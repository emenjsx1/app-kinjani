import type {
  FileGraphEdge,
  FileGraphNode,
  SerializedFileGraph,
} from "../types";

/**
 * In-memory dependency graph for the generated project.
 *
 * Tracks:
 *  - nodes: every emitted file (page, layout, component, lib, asset, style, config)
 *  - edges: import / asset / style / component relationships between files
 *
 * Used by:
 *  - the codegen pipeline (cycle / dangling import detection)
 *  - the future export system (knowing what to bundle)
 *  - the AI orchestrator (impact analysis before mutations)
 */
export class FileGraph {
  private nodes = new Map<string, FileGraphNode>();
  private edges: FileGraphEdge[] = [];

  addNode(node: FileGraphNode): void {
    const existing = this.nodes.get(node.path);
    if (existing) {
      this.nodes.set(node.path, { ...existing, ...node });
    } else {
      this.nodes.set(node.path, node);
    }
  }

  addEdge(edge: FileGraphEdge): void {
    this.edges.push(edge);
  }

  hasNode(path: string): boolean {
    return this.nodes.has(path);
  }

  outgoing(path: string): FileGraphEdge[] {
    return this.edges.filter((e) => e.from === path);
  }

  incoming(path: string): FileGraphEdge[] {
    return this.edges.filter((e) => e.to === path);
  }

  /** Returns paths that no other file imports (entry points + orphans). */
  roots(): string[] {
    const referenced = new Set(this.edges.map((e) => e.to));
    return Array.from(this.nodes.keys()).filter((p) => !referenced.has(p));
  }

  /** Cycle detection (DFS). Returns the first cycle as a path list or null. */
  detectCycle(): string[] | null {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const adj = new Map<string, string[]>();
    for (const e of this.edges) {
      if (e.kind !== "import") continue;
      const list = adj.get(e.from) ?? [];
      list.push(e.to);
      adj.set(e.from, list);
    }
    const trail: string[] = [];
    const dfs = (node: string): string[] | null => {
      if (stack.has(node)) {
        const idx = trail.indexOf(node);
        return trail.slice(idx >= 0 ? idx : 0).concat(node);
      }
      if (visited.has(node)) return null;
      visited.add(node);
      stack.add(node);
      trail.push(node);
      for (const next of adj.get(node) ?? []) {
        const cycle = dfs(next);
        if (cycle) return cycle;
      }
      stack.delete(node);
      trail.pop();
      return null;
    };
    for (const n of this.nodes.keys()) {
      const cycle = dfs(n);
      if (cycle) return cycle;
    }
    return null;
  }

  /** Imports that point to files not registered as nodes. */
  danglingImports(): FileGraphEdge[] {
    return this.edges.filter(
      (e) =>
        e.kind === "import" &&
        (e.to.startsWith("./") || e.to.startsWith("@/")) &&
        !this.hasNode(e.to),
    );
  }

  serialize(): SerializedFileGraph {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
    };
  }
}
