import { memo, useMemo, useCallback } from "react";
import { ChevronRight, Eye, EyeOff, Lock, Unlock, Layers as LayersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LayerNode, LayerTreeState } from "@/core/editor/layerTree";
import { buildLayerTree, EMPTY_LAYER_TREE_STATE, flattenLayerTree } from "@/core/editor/layerTree";
import type { Project } from "@/core/projects/types";
import { useEditorSelection } from "../hooks/useEditorSelection";
import { create } from "zustand";

interface LayerUiState extends LayerTreeState {
  setExpanded: (id: string, v: boolean) => void;
  toggleLocked: (id: string) => void;
  toggleHidden: (id: string) => void;
}

const useLayerUi = create<LayerUiState>((set) => ({
  ...EMPTY_LAYER_TREE_STATE,
  setExpanded: (id, v) => set((s) => ({ expanded: { ...s.expanded, [id]: v } })),
  toggleLocked: (id) => set((s) => ({ locked: { ...s.locked, [id]: !s.locked[id] } })),
  toggleHidden: (id) => set((s) => ({ hidden: { ...s.hidden, [id]: !s.hidden[id] } })),
}));

interface Props {
  project: Project | null;
  onSectionVisibilityToggle?: (sectionId: string, visible: boolean) => void;
}

/**
 * Advanced layer tree — hierarchical, with visibility / lock / expand
 * controls and selection sync. The current data model is page→section but
 * the renderer is recursive and ready for nested widgets/slots.
 */
export const LayerTreePanel = memo(function LayerTreePanel({
  project,
  onSectionVisibilityToggle,
}: Props) {
  const treeState = useLayerUi();
  const tree = useMemo(() => buildLayerTree(project, treeState), [project, treeState]);
  const flat = useMemo(() => flattenLayerTree(tree), [tree]);
  const { selection, select } = useEditorSelection();

  const handleSelect = useCallback(
    (node: LayerNode) => {
      if (node.kind === "page") {
        select({ pageId: node.refId ?? null, sectionId: null, widgetId: null });
      } else if (node.kind === "section") {
        select({ sectionId: node.refId ?? null, widgetId: null });
      }
    },
    [select],
  );

  if (!project) {
    return <div className="p-4 text-xs text-muted-foreground">Sem projeto carregado.</div>;
  }

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 px-2 mb-1.5">
        <LayersIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Camadas
        </h3>
      </div>
      <ul className="space-y-0.5">
        {flat.map((node) => {
          const isSelected =
            (node.kind === "section" && selection.sectionId === node.refId) ||
            (node.kind === "page" && selection.pageId === node.refId && !selection.sectionId);
          const depth = depthOf(node, flat);
          return (
            <li key={node.id}>
              <div
                className={cn(
                  "group flex items-center gap-1 px-1 py-1 rounded text-xs cursor-pointer hover:bg-muted/60",
                  isSelected && "bg-primary/10 text-foreground",
                  !node.visible && "opacity-50",
                )}
                style={{ paddingLeft: 4 + depth * 12 }}
                onClick={() => handleSelect(node)}
              >
                {node.children.length > 0 ? (
                  <button
                    className="flex items-center justify-center w-4 h-4 -ml-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      treeState.setExpanded(node.id, !node.expanded);
                    }}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        node.expanded && "rotate-90",
                      )}
                    />
                  </button>
                ) : (
                  <span className="w-4" />
                )}
                <span
                  className={cn(
                    "flex-1 truncate font-medium",
                    node.kind === "page" && "text-[11px] uppercase tracking-wider text-muted-foreground",
                  )}
                >
                  {node.label}
                </span>
                {node.kind === "section" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 data-[on=true]:opacity-100"
                      data-on={!node.visible || treeState.locked[node.id] ? "true" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        treeState.toggleLocked(node.id);
                      }}
                      title={treeState.locked[node.id] ? "Desbloquear" : "Bloquear"}
                    >
                      {treeState.locked[node.id] ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 data-[on=true]:opacity-100"
                      data-on={!node.visible ? "true" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = !node.visible;
                        if (node.refId) onSectionVisibilityToggle?.(node.refId, next);
                      }}
                      title={node.visible ? "Ocultar" : "Mostrar"}
                    >
                      {node.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

function depthOf(node: LayerNode, flat: LayerNode[]): number {
  let depth = 0;
  let cur: LayerNode | undefined = node;
  while (cur?.parentId) {
    depth += 1;
    cur = flat.find((n) => n.id === cur!.parentId);
    if (!cur) break;
  }
  return depth;
}
