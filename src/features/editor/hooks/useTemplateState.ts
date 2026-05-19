/**
 * useTemplateState — central bridge between the live WebsiteTemplate the
 * preview engine renders and the Project + history engines used by the
 * editor commands. Owns:
 *
 *   - the React state holding the current WebsiteTemplate
 *   - hydrates from initial template on mount
 *   - exposes mutators that update template AND push a snapshot
 *   - listens to historyStore.undo/redo (via version bumps) and rehydrates
 *     the template from the snapshot when it changes externally
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { templateToProject, projectToTemplate } from "@/core/projects/types";
import type { Project } from "@/core/projects/types";
import { useHistoryStore } from "../store/historyStore";
import { useEditorStore } from "../store/editorStore";

export interface TemplateApi {
  template: WebsiteTemplate;
  project: Project;
  version: number;
  /** Replace the entire template (e.g. AI patch). */
  setTemplate: (next: WebsiteTemplate, label?: string) => void;
  patchTemplate: (patch: Partial<WebsiteTemplate>, label?: string) => void;
  updateSection: (id: string, patch: Partial<WebsiteSection>) => void;
  updateSectionContent: (id: string, kv: Record<string, string>) => void;
  reorderSections: (orderedIds: string[]) => void;
  moveSection: (id: string, delta: -1 | 1) => void;
  toggleSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  addSection: (s: WebsiteSection) => void;
}

export function useTemplateState(
  websiteId: string,
  websiteName: string,
  initial: WebsiteTemplate,
): TemplateApi {
  const [template, setTemplateInternal] = useState<WebsiteTemplate>(initial);
  const initialRef = useRef(initial);
  const push = useHistoryStore((s) => s.push);
  const init = useHistoryStore((s) => s.init);
  const engine = useHistoryStore((s) => s.engine);
  const histVersion = useHistoryStore((s) => s.version);
  const setDirty = useEditorStore((s) => s.setDirty);
  const externalSyncRef = useRef(false);

  // Initialize history on mount / website change.
  useEffect(() => {
    const proj = templateToProject(websiteId, websiteName, initialRef.current);
    init(proj);
    setTemplateInternal(initialRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  // When history version advances and the current snapshot differs from
  // local template, hydrate (undo/redo case).
  useEffect(() => {
    if (!engine) return;
    const snap = engine.state;
    if (!snap) return;
    const fromSnap = projectToTemplate(snap);
    externalSyncRef.current = true;
    setTemplateInternal((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(fromSnap)) return prev;
      return fromSnap;
    });
  }, [histVersion, engine]); // eslint-disable-line react-hooks/exhaustive-deps

  const project = useMemo(
    () => templateToProject(websiteId, websiteName, template),
    [websiteId, websiteName, template],
  );

  const commit = useCallback(
    (next: WebsiteTemplate, label?: string) => {
      setTemplateInternal(next);
      const proj = templateToProject(websiteId, websiteName, next);
      push(proj, label);
      setDirty(true);
    },
    [push, setDirty, websiteId, websiteName],
  );

  const setTemplate = useCallback(
    (next: WebsiteTemplate, label?: string) => commit(next, label ?? "set template"),
    [commit],
  );

  const patchTemplate = useCallback(
    (patch: Partial<WebsiteTemplate>, label?: string) =>
      commit({ ...template, ...patch }, label ?? "patch template"),
    [commit, template],
  );

  const updateSection = useCallback(
    (id: string, patch: Partial<WebsiteSection>) => {
      const next: WebsiteTemplate = {
        ...template,
        sections: template.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      };
      commit(next, "update section");
    },
    [commit, template],
  );

  const updateSectionContent = useCallback(
    (id: string, kv: Record<string, string>) => {
      const next: WebsiteTemplate = {
        ...template,
        sections: template.sections.map((s) =>
          s.id === id ? { ...s, content: { ...s.content, ...kv } } : s,
        ),
      };
      commit(next, "edit content");
    },
    [commit, template],
  );

  const reorderSections = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(template.sections.map((s) => [s.id, s]));
      const ordered = orderedIds
        .map((id, i) => {
          const s = byId.get(id);
          return s ? { ...s, order: i } : null;
        })
        .filter((s): s is WebsiteSection => !!s);
      const rest = template.sections
        .filter((s) => !orderedIds.includes(s.id))
        .map((s, i) => ({ ...s, order: orderedIds.length + i }));
      commit({ ...template, sections: [...ordered, ...rest] }, "reorder sections");
    },
    [commit, template],
  );

  const moveSection = useCallback(
    (id: string, delta: -1 | 1) => {
      const ordered = [...template.sections].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((s) => s.id === id);
      const ni = idx + delta;
      if (idx < 0 || ni < 0 || ni >= ordered.length) return;
      const ids = ordered.map((s) => s.id);
      [ids[idx], ids[ni]] = [ids[ni], ids[idx]];
      reorderSections(ids);
    },
    [reorderSections, template.sections],
  );

  const toggleSection = useCallback(
    (id: string) => {
      const s = template.sections.find((x) => x.id === id);
      if (!s) return;
      updateSection(id, { enabled: !s.enabled });
    },
    [template.sections, updateSection],
  );

  const duplicateSection = useCallback(
    (id: string) => {
      const s = template.sections.find((x) => x.id === id);
      if (!s) return;
      const copy: WebsiteSection = {
        ...s,
        id: `${s.type}-${Date.now()}`,
        order: s.order + 1,
      };
      const ordered = [...template.sections]
        .map((x) => (x.order > s.order ? { ...x, order: x.order + 1 } : x))
        .concat(copy);
      commit({ ...template, sections: ordered }, "duplicate section");
    },
    [commit, template],
  );

  const removeSection = useCallback(
    (id: string) => {
      commit(
        { ...template, sections: template.sections.filter((s) => s.id !== id) },
        "remove section",
      );
    },
    [commit, template],
  );

  const addSection = useCallback(
    (s: WebsiteSection) => {
      const maxOrder = template.sections.reduce((m, x) => Math.max(m, x.order), -1);
      commit(
        { ...template, sections: [...template.sections, { ...s, order: maxOrder + 1 }] },
        "add section",
      );
    },
    [commit, template],
  );

  return {
    template,
    project,
    version: histVersion,
    setTemplate,
    patchTemplate,
    updateSection,
    updateSectionContent,
    reorderSections,
    moveSection,
    toggleSection,
    duplicateSection,
    removeSection,
    addSection,
  };
}
