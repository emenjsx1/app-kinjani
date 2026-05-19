import type { Project } from "@/core/projects/types";

/**
 * Canvas adapter: abstracts whether the editor surface is rendered via the
 * DOM template engine (current), a Sandpack iframe, a WebContainer, or a
 * native canvas in the future.
 */
export interface CanvasAdapter {
  id: string;
  mount(container: HTMLElement, project: Project): void | Promise<void>;
  update(project: Project): void | Promise<void>;
  hitTest(x: number, y: number): { sectionId?: string; widgetId?: string } | null;
  dispose(): void;
}
