import { memo, useMemo } from "react";
import { componentRegistry } from "@/core/registry/registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Project } from "@/core/projects/types";
import { useEditorSelection } from "../hooks/useEditorSelection";
import { useEditorActions } from "../hooks/useEditorActions";

export const PropertiesPanel = memo(function PropertiesPanel({
  project,
}: {
  project: Project | null;
}) {
  const { selection } = useEditorSelection();
  const actions = useEditorActions(project);

  const section = useMemo(() => {
    if (!project || !selection.sectionId) return null;
    for (const p of project.pages) {
      const s = p.sections.find((x) => x.id === selection.sectionId);
      if (s) return s;
    }
    return null;
  }, [project, selection.sectionId]);

  if (!section) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        Selecciona uma secção para editar as propriedades.
      </div>
    );
  }

  const def = componentRegistry.getByType("section", section.type);
  const fields = def?.schema.fields ?? [];

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground">
        {def?.label ?? section.type}
      </h3>
      {fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <Label className="text-xs">{f.label}</Label>
          <Input
            value={section.content[f.key] ?? ""}
            onChange={(e) =>
              actions.setSectionContent(section.id, { [f.key]: e.target.value })
            }
            className="h-8 text-xs"
          />
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Esta secção não tem propriedades editáveis no registry.
        </p>
      )}
    </div>
  );
});
