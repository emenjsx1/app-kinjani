import { memo } from "react";
import { ArrowLeft, Save, Undo2, Redo2 } from "lucide-react";
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
    <header className="flex items-center justify-between border-b bg-background px-4 py-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-semibold">{title}</h1>
        {dirty && <Badge variant="outline">Não guardado</Badge>}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => undo()} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => redo()} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </header>
  );
});
