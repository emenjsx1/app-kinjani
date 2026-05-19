import { memo } from "react";
import { ArrowLeft, Save, Undo2, Redo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "../store/editorStore";
import { useHistoryStore } from "../store/historyStore";

interface Props {
  title: string;
  onBack: () => void;
  onSave: () => void;
  saving?: boolean;
}

export const EditorHeader = memo(function EditorHeader({
  title,
  onBack,
  onSave,
  saving,
}: Props) {
  const dirty = useEditorStore((s) => s.dirty);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo());
  const canRedo = useHistoryStore((s) => s.canRedo());

  return (
    <header className="flex items-center justify-between border-b bg-background px-3 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-semibold truncate">{title}</h1>
        {dirty && (
          <Badge variant="outline" className="h-5 text-[10px] font-normal">
            Não guardado
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => undo()}
          disabled={!canUndo}
          title="Anular (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => redo()}
          disabled={!canRedo}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving} className="h-8 ml-1">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          {saving ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </header>
  );
});
