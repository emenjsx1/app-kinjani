/**
 * Layer Tree Engine.
 *
 * Builds a hierarchical layer representation from a Project. The current
 * data model is flat (pages → sections) but the LayerNode shape is recursive
 * so nested components / slots can be supported later without API changes.
 */
import type { Project, ProjectPage } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";

export type LayerKind = "page" | "section" | "widget" | "slot";

export interface LayerNode {
  id: string;
  kind: LayerKind;
  label: string;
  type?: string;
  visible: boolean;
  locked: boolean;
  expanded: boolean;
  parentId: string | null;
  children: LayerNode[];
  /** Pointer back to underlying section/widget id for hit-testing. */
  refId?: string;
  meta?: Record<string, unknown>;
}

export interface LayerTreeState {
  /** Expanded node ids. */
  expanded: Record<string, boolean>;
  /** Locked node ids. */
  locked: Record<string, boolean>;
  /** Hidden node ids (visibility overrides — not the same as section.enabled). */
  hidden: Record<string, boolean>;
}

const sectionLabel = (s: WebsiteSection): string =>
  (s.title && s.title.trim()) || s.type;

export function buildLayerTree(
  project: Project | null,
  state: LayerTreeState,
): LayerNode[] {
  if (!project) return [];
  return project.pages.map((page) => pageToLayer(page, state));
}

function pageToLayer(page: ProjectPage, state: LayerTreeState): LayerNode {
  const sections = [...page.sections].sort((a, b) => a.order - b.order);
  return {
    id: `page:${page.id}`,
    kind: "page",
    label: page.name,
    visible: !state.hidden[`page:${page.id}`],
    locked: !!state.locked[`page:${page.id}`],
    expanded: state.expanded[`page:${page.id}`] ?? true,
    parentId: null,
    refId: page.id,
    children: sections.map((s) => sectionToLayer(s, page.id, state)),
  };
}

function sectionToLayer(
  section: WebsiteSection,
  pageId: string,
  state: LayerTreeState,
): LayerNode {
  const id = `section:${section.id}`;
  return {
    id,
    kind: "section",
    label: sectionLabel(section),
    type: section.type,
    visible: section.enabled && !state.hidden[id],
    locked: !!state.locked[id],
    expanded: state.expanded[id] ?? false,
    parentId: `page:${pageId}`,
    refId: section.id,
    children: [],
  };
}

export function flattenLayerTree(nodes: LayerNode[]): LayerNode[] {
  const out: LayerNode[] = [];
  const walk = (list: LayerNode[]) => {
    for (const n of list) {
      out.push(n);
      if (n.expanded && n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export const EMPTY_LAYER_TREE_STATE: LayerTreeState = {
  expanded: {},
  locked: {},
  hidden: {},
};
