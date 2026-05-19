import { useCallback } from "react";
import { useHistoryStore } from "../store/historyStore";
import type { Project } from "@/core/projects/types";

export function useEditorHistory() {
  const push = useHistoryStore((s) => s.push);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const init = useHistoryStore((s) => s.init);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());

  const snapshot = useCallback(
    (project: Project, label?: string) => push(project, label),
    [push],
  );

  return { init, snapshot, undo, redo, canUndo, canRedo };
}
