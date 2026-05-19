import { memo } from "react";
import { Layers, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Project } from "@/core/projects/types";
import { useEditorSelection } from "../hooks/useEditorSelection";
import { useEditorActions } from "../hooks/useEditorActions";

export const LayersPanel = memo(function LayersPanel({ project }: { project: Project | null }) {
  const { selection, select } = useEditorSelection();
  const actions = useEditorActions(project);
  const home = project?.pages.find((p) => p.isHomepage) ?? project?.pages[0];

  if (!home) return null;

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase text-muted-foreground">Camadas</h3>
      </div>
      <ul className="space-y-0.5">
        {home.sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((s) => (
            <li key={s.id}>
              <button
                onClick={() => select({ pageId: home.id, sectionId: s.id, widgetId: null })}
                className={cn(
                  "w-full flex items-center justify-between text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors",
                  selection.sectionId === s.id && "bg-muted font-medium",
                )}
              >
                <span className="truncate">{s.title || s.type}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.toggleSection(s.id, !s.enabled);
                  }}
                >
                  {s.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-50" />}
                </Button>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
});
