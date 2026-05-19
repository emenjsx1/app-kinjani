/**
 * ComponentGraph — immutable-friendly operations over composition graphs.
 *
 * All mutations return NEW graph instances (structural sharing) so the
 * editor history, undo/redo, AI rollback, and conflict-detection layers
 * can diff cheaply.
 */

import type { ComponentGraph, CompositionNode, NodeId } from "./types";

export class ComponentGraphOps {
  static create(root: CompositionNode): ComponentGraph {
    return { rootId: root.id, nodes: { [root.id]: root } };
  }

  static insertChild(
    graph: ComponentGraph,
    parentId: NodeId,
    slotId: string,
    node: CompositionNode,
    index?: number,
  ): ComponentGraph {
    const parent = graph.nodes[parentId];
    if (!parent) throw new Error(`Parent ${parentId} not in graph`);

    const slot = parent.slots[slotId] ?? [];
    const i = index ?? slot.length;
    const nextSlot = [...slot.slice(0, i), node.id, ...slot.slice(i)];

    return {
      ...graph,
      nodes: {
        ...graph.nodes,
        [parentId]: { ...parent, slots: { ...parent.slots, [slotId]: nextSlot } },
        [node.id]: node,
      },
    };
  }

  static removeNode(graph: ComponentGraph, nodeId: NodeId): ComponentGraph {
    if (nodeId === graph.rootId) {
      throw new Error("Cannot remove root node");
    }
    const nodes = { ...graph.nodes };
    const descendants = ComponentGraphOps.descendants(graph, nodeId);
    delete nodes[nodeId];
    for (const d of descendants) delete nodes[d];

    // detach from parent
    for (const id of Object.keys(nodes)) {
      const n = nodes[id];
      const slots = { ...n.slots };
      let touched = false;
      for (const sId of Object.keys(slots)) {
        if (slots[sId].includes(nodeId)) {
          slots[sId] = slots[sId].filter((x) => x !== nodeId);
          touched = true;
        }
      }
      if (touched) nodes[id] = { ...n, slots };
    }
    return { ...graph, nodes };
  }

  static moveNode(
    graph: ComponentGraph,
    nodeId: NodeId,
    targetParent: NodeId,
    targetSlot: string,
    index?: number,
  ): ComponentGraph {
    if (nodeId === graph.rootId) throw new Error("Cannot move root");
    if (ComponentGraphOps.descendants(graph, nodeId).has(targetParent)) {
      throw new Error("Cannot move a node into its own subtree");
    }
    let next = graph;
    const node = graph.nodes[nodeId];
    if (!node) throw new Error(`Node ${nodeId} not in graph`);

    // detach
    next = {
      ...next,
      nodes: Object.fromEntries(
        Object.entries(next.nodes).map(([id, n]) => {
          const slots: Record<string, NodeId[]> = {};
          let changed = false;
          for (const [sId, children] of Object.entries(n.slots)) {
            if (children.includes(nodeId)) {
              slots[sId] = children.filter((x) => x !== nodeId);
              changed = true;
            } else {
              slots[sId] = children;
            }
          }
          return [id, changed ? { ...n, slots } : n];
        }),
      ),
    };

    // attach
    const parent = next.nodes[targetParent];
    const slot = parent.slots[targetSlot] ?? [];
    const i = index ?? slot.length;
    const nextSlot = [...slot.slice(0, i), nodeId, ...slot.slice(i)];
    return {
      ...next,
      nodes: {
        ...next.nodes,
        [targetParent]: { ...parent, slots: { ...parent.slots, [targetSlot]: nextSlot } },
      },
    };
  }

  static updateProps(
    graph: ComponentGraph,
    nodeId: NodeId,
    patch: Record<string, unknown>,
  ): ComponentGraph {
    const n = graph.nodes[nodeId];
    if (!n) throw new Error(`Node ${nodeId} not in graph`);
    return {
      ...graph,
      nodes: { ...graph.nodes, [nodeId]: { ...n, props: { ...n.props, ...patch } } },
    };
  }

  static descendants(graph: ComponentGraph, nodeId: NodeId): Set<NodeId> {
    const out = new Set<NodeId>();
    const walk = (id: NodeId) => {
      const n = graph.nodes[id];
      if (!n) return;
      for (const sId of Object.keys(n.slots)) {
        for (const c of n.slots[sId]) {
          out.add(c);
          walk(c);
        }
      }
    };
    walk(nodeId);
    return out;
  }

  static parentOf(graph: ComponentGraph, nodeId: NodeId): NodeId | undefined {
    for (const [id, n] of Object.entries(graph.nodes)) {
      for (const children of Object.values(n.slots)) {
        if (children.includes(nodeId)) return id;
      }
    }
    return undefined;
  }
}
