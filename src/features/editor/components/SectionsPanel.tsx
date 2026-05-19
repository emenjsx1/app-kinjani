import { memo } from "react";
import { componentRegistry } from "@/core/registry/registry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";
import { useEditorActions } from "../hooks/useEditorActions";

export const SectionsPanel = memo(function SectionsPanel({ project }: { project: Project | null }) {
  const actions = useEditorActions(project);
  const defs = componentRegistry.byCategory("section");

  return (
    <div className="p-3 space-y-2">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground px-1">Adicionar Secção</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {defs.map((d) => (
          <Button
            key={d.id}
            variant="outline"
            size="sm"
            className="h-auto py-2 flex flex-col items-start gap-0.5"
            onClick={() => {
              const section: WebsiteSection = {
                id: `${d.type}-${Date.now()}`,
                type: d.type as WebsiteSection["type"],
                title: d.label,
                content: {},
                enabled: true,
                order: 0,
                variant: 1,
              };
              actions.addSection(section);
            }}
          >
            <Plus className="h-3 w-3" />
            <span className="text-xs">{d.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});
