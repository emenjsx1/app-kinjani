import { memo } from "react";
import { componentRegistry } from "@/core/registry/registry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";

interface Props {
  project: Project | null;
  onAdd: (section: WebsiteSection) => void;
}

export const SectionsPanel = memo(function SectionsPanel({ project, onAdd }: Props) {
  const defs = componentRegistry.byCategory("section");
  if (!project) return null;
  return (
    <div className="p-3 space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Adicionar
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        {defs.map((d) => (
          <Button
            key={d.id}
            variant="outline"
            size="sm"
            className="h-auto py-2 px-2 flex flex-col items-start gap-0.5"
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
              onAdd(section);
            }}
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-left">{d.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});
