import { useEditorStore } from "../store/editorStore";

export function useEditorSelection() {
  const selection = useEditorStore((s) => s.selection);
  const select = useEditorStore((s) => s.select);
  const clear = useEditorStore((s) => s.clearSelection);
  return { selection, select, clear };
}
