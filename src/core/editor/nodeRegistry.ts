/**
 * Canvas Node Registry.
 *
 * Maps canvas node ids (sections, widgets, future nested components) to the
 * DOM elements rendered by the preview engine. Overlay components read from
 * this registry — they never traverse the DOM themselves. The registry is
 * intentionally process-local; if multiple canvas instances coexist they
 * should each instantiate their own.
 */
export interface CanvasNodeRecord {
  id: string;
  kind: "section" | "widget" | "page" | "slot";
  element: HTMLElement;
  parentId?: string;
}

type Listener = () => void;

export class CanvasNodeRegistry {
  private nodes = new Map<string, CanvasNodeRecord>();
  private listeners = new Set<Listener>();

  register(rec: CanvasNodeRecord): void {
    this.nodes.set(rec.id, rec);
    this.emit();
  }
  unregister(id: string): void {
    this.nodes.delete(id);
    this.emit();
  }
  get(id: string): CanvasNodeRecord | undefined {
    return this.nodes.get(id);
  }
  all(): CanvasNodeRecord[] {
    return Array.from(this.nodes.values());
  }
  hitTest(x: number, y: number): CanvasNodeRecord | null {
    let best: { rec: CanvasNodeRecord; area: number } | null = null;
    for (const rec of this.nodes.values()) {
      const r = rec.element.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const area = r.width * r.height;
        // smallest enclosing match wins (nested-friendly)
        if (!best || area < best.area) best = { rec, area };
      }
    }
    return best?.rec ?? null;
  }
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  clear(): void {
    this.nodes.clear();
    this.emit();
  }
  private emit(): void {
    for (const l of this.listeners) l();
  }
}
