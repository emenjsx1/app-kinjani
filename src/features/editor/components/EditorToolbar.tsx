import { memo } from "react";
import { Monitor, Tablet, Smartphone, Eye, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store/editorStore";
import type { EditorDevice } from "@/core/editor/types";

const devices: Array<{ id: EditorDevice; icon: typeof Monitor; label: string }> = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export const EditorToolbar = memo(function EditorToolbar() {
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const toggleAI = useEditorStore((s) => s.toggleAIPanel);
  const aiOpen = useEditorStore((s) => s.aiPanelOpen);

  return (
    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-1.5">
      <div className="flex items-center gap-1">
        <Button
          variant={mode === "edit" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
        <Button
          variant={mode === "preview" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Pré-visualizar
        </Button>
      </div>
      <div className="flex items-center gap-1">
        {devices.map((d) => (
          <Button
            key={d.id}
            variant={device === d.id ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDevice(d.id)}
            aria-label={d.label}
          >
            <d.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <Button
        variant={aiOpen ? "secondary" : "ghost"}
        size="sm"
        onClick={() => toggleAI()}
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> IA
      </Button>
    </div>
  );
});
