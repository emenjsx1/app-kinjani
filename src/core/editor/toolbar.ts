/**
 * Inline Toolbar Registry.
 *
 * Selected canvas nodes expose a list of contextual floating actions. The
 * registry is extensible so future modules (animations, code-edit, AI ops,
 * locking, layouts) can contribute actions without modifying the editor
 * surface code.
 */
import type { LayerKind } from "./layerTree";

export interface InlineToolbarAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  group?: "transform" | "edit" | "ai" | "danger" | "meta";
  destructive?: boolean;
  /** Visibility predicate — gate by selected node kind. */
  appliesTo?: (kind: LayerKind, ctx: InlineToolbarContext) => boolean;
  /** Action handler — runs in the editor scope. */
  run: (ctx: InlineToolbarContext) => void | Promise<void>;
}

export interface InlineToolbarContext {
  nodeId: string;
  kind: LayerKind;
  refId?: string;
  /** Optional payload provided by the surface. */
  meta?: Record<string, unknown>;
}

class InlineToolbarRegistry {
  private actions = new Map<string, InlineToolbarAction>();

  register(a: InlineToolbarAction): void {
    this.actions.set(a.id, a);
  }
  unregister(id: string): void {
    this.actions.delete(id);
  }
  all(): InlineToolbarAction[] {
    return Array.from(this.actions.values());
  }
  resolve(kind: LayerKind, ctx: InlineToolbarContext): InlineToolbarAction[] {
    return this.all().filter((a) => !a.appliesTo || a.appliesTo(kind, ctx));
  }
  clear(): void {
    this.actions.clear();
  }
}

export const inlineToolbarRegistry = new InlineToolbarRegistry();
