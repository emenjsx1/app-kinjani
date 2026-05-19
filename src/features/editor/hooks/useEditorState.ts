import { useEditorStore } from "../store/editorStore";

export function useEditorState() {
  return useEditorStore();
}
