import { useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";
import { useEditorStore } from "../store/editorStore";
import { useCanvasStore } from "../store/canvasStore";

interface ShortcutOptions {
  onSave?: () => void;
}

/**
 * Global keyboard shortcuts for the canvas editor.
 *
 *  - Cmd/Ctrl + Z         → undo
 *  - Cmd/Ctrl + Shift + Z → redo
 *  - Cmd/Ctrl + Y         → redo
 *  - Cmd/Ctrl + S         → save (via onSave)
 *  - Esc                  → clear selection
 *  - 1 / 2 / 3            → desktop / tablet / mobile (when no input focused)
 *  - +/-                  → zoom in/out
 *  - 0                    → reset zoom
 */
export function useEditorShortcuts(enabled = true, opts: ShortcutOptions = {}) {
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const setDevice = useCanvasStore((s) => s.setDevice);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);

  useEffect(() => {
    if (!enabled) return;
    const inField = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
    };
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && k === "z" && e.shiftKey) || (mod && k === "y")) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && k === "s") {
        e.preventDefault();
        opts.onSave?.();
        return;
      }
      if (k === "escape") {
        clearSelection();
        return;
      }
      if (inField(e.target)) return;
      if (k === "1") setDevice("desktop");
      else if (k === "2") setDevice("tablet");
      else if (k === "3") setDevice("mobile");
      else if (mod && (k === "=" || k === "+")) {
        e.preventDefault();
        zoomIn();
      } else if (mod && k === "-") {
        e.preventDefault();
        zoomOut();
      } else if (mod && k === "0") {
        e.preventDefault();
        resetZoom();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, undo, redo, clearSelection, setDevice, zoomIn, zoomOut, resetZoom, opts]);
}
