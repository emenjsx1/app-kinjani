import { useCallback } from "react";
import { commands } from "@/core/editor/commands";
import type { Project } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";
import { useHistoryStore } from "../store/historyStore";
import { useEditorStore } from "../store/editorStore";

/**
 * High-level editor actions. Every action runs a pure command, pushes the
 * result onto the history stack, and marks the editor dirty.
 */
export function useEditorActions(project: Project | null) {
  const push = useHistoryStore((s) => s.push);
  const setDirty = useEditorStore((s) => s.setDirty);

  const run = useCallback(
    (next: Project, label?: string) => {
      push(next, label);
      setDirty(true);
      return next;
    },
    [push, setDirty],
  );

  return {
    setSectionContent: useCallback(
      (sectionId: string, patch: Record<string, string>) =>
        project ? run(commands.setSectionContent(project, sectionId, patch), "edit content") : null,
      [project, run],
    ),
    toggleSection: useCallback(
      (sectionId: string, enabled: boolean) =>
        project ? run(commands.toggleSection(project, sectionId, enabled), "toggle section") : null,
      [project, run],
    ),
    reorderSections: useCallback(
      (orderedIds: string[]) =>
        project ? run(commands.reorderSections(project, orderedIds), "reorder") : null,
      [project, run],
    ),
    addSection: useCallback(
      (section: WebsiteSection) =>
        project ? run(commands.addSection(project, section), "add section") : null,
      [project, run],
    ),
    removeSection: useCallback(
      (sectionId: string) =>
        project ? run(commands.removeSection(project, sectionId), "remove section") : null,
      [project, run],
    ),
    setTheme: useCallback(
      (theme: Partial<Project["theme"]>) =>
        project ? run(commands.setTheme(project, theme), "theme") : null,
      [project, run],
    ),
    setSettings: useCallback(
      (settings: Partial<Project["settings"]>) =>
        project ? run(commands.setSettings(project, settings), "settings") : null,
      [project, run],
    ),
  };
}
