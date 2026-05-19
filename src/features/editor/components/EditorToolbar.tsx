import { memo } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Pencil,
  Sparkles,
  Grid3x3,
  Ruler,
  Box,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCanvasStore } from "../store/canvasStore";
import { useEditorStore } from "../store/editorStore";
import type { EditorDevice } from "@/core/editor/types";
import { cn } from "@/lib/utils";

const devices: Array<{ id: EditorDevice; icon: typeof Monitor; label: string; shortcut: string }> = [
  { id: "desktop", icon: Monitor, label: "Desktop", shortcut: "1" },
  { id: "tablet", icon: Tablet, label: "Tablet", shortcut: "2" },
  { id: "mobile", icon: Smartphone, label: "Mobile", shortcut: "3" },
];

export const EditorToolbar = memo(function EditorToolbar() {
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const device = useCanvasStore((s) => s.device);
  const setDevice = useCanvasStore((s) => s.setDevice);
  const zoom = useCanvasStore((s) => s.zoom);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);
  const showGrid = useCanvasStore((s) => s.showGrid);
  const toggleGrid = useCanvasStore((s) => s.toggleGrid);
  const showSpacing = useCanvasStore((s) => s.showSpacing);
  const toggleSpacing = useCanvasStore((s) => s.toggleSpacing);
  const showOutlines = useCanvasStore((s) => s.showOutlines);
  const toggleOutlines = useCanvasStore((s) => s.toggleOutlines);
  const aiOpen = useEditorStore((s) => s.aiPanelOpen);
  const toggleAI = useEditorStore((s) => s.toggleAIPanel);

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-1.5 text-xs">
      <div className="flex items-center gap-1">
        <ModeBtn active={mode === "edit"} onClick={() => setMode("edit")} icon={<Pencil className="h-3.5 w-3.5" />}>
          Editar
        </ModeBtn>
        <ModeBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={<Eye className="h-3.5 w-3.5" />}>
          Pré-visualizar
        </ModeBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <IconToggle on={showOutlines} onClick={() => toggleOutlines()} title="Contornos">
          <Box className="h-3.5 w-3.5" />
        </IconToggle>
        <IconToggle on={showGrid} onClick={() => toggleGrid()} title="Grelha">
          <Grid3x3 className="h-3.5 w-3.5" />
        </IconToggle>
        <IconToggle on={showSpacing} onClick={() => toggleSpacing()} title="Espaçamento">
          <Ruler className="h-3.5 w-3.5" />
        </IconToggle>
      </div>

      <div className="flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
        {devices.map((d) => (
          <Button
            key={d.id}
            variant={device === d.id ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDevice(d.id)}
            title={`${d.label} (${d.shortcut})`}
          >
            <d.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => zoomOut()} title="Diminuir zoom">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            className="px-1.5 text-[11px] tabular-nums text-muted-foreground hover:text-foreground min-w-[3rem]"
            onClick={() => resetZoom()}
            title="Repor zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => zoomIn()} title="Aumentar zoom">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          variant={aiOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => toggleAI()}
          className="h-7"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> IA
        </Button>
      </div>
    </div>
  );
});

function ModeBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className="h-7"
    >
      {icon}
      <span className="ml-1.5">{children}</span>
    </Button>
  );
}

function IconToggle({
  on,
  onClick,
  title,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", on && "bg-secondary text-secondary-foreground")}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}
