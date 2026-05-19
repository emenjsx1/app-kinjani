import { memo, useMemo } from "react";
import { componentRegistry } from "@/core/registry/registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/core/projects/types";
import { useEditorSelection } from "../hooks/useEditorSelection";

interface Props {
  project: Project | null;
  onPatch: (sectionId: string, kv: Record<string, string>) => void;
}

/**
 * Properties panel for the selected section. Reads the schema from the
 * component registry and renders inputs for every declared field. Falls back
 * to listing the section's existing content keys when the schema is empty
 * (legacy sections).
 */
export const PropertiesPanel = memo(function PropertiesPanel({ project, onPatch }: Props) {
  const { selection } = useEditorSelection();

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
      <div className="p-6 text-xs text-muted-foreground text-center">
        <p className="mb-1 font-medium">Nenhuma seleção</p>
        <p className="opacity-70">Clica numa secção da tela para editar.</p>
      </div>
    );
  }

  const def = componentRegistry.getByType("section", section.type);
  const schemaFields = def?.schema.fields ?? [];
  const fallbackFields = Object.keys(section.content).map((k) => ({
    key: k,
    label: humanize(k),
    type: section.content[k]?.length > 80 ? ("textarea" as const) : ("text" as const),
  }));
  const fields = schemaFields.length > 0 ? schemaFields : fallbackFields;

  return (
    <div className="p-3 space-y-3">
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {def?.label ?? section.type}
        </h3>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {section.title || section.id}
        </p>
      </div>
      <div className="space-y-3">
        {fields.map((f) => {
          const value = section.content[f.key] ?? "";
          const isLong = (f as { type?: string }).type === "textarea" || value.length > 80;
          return (
            <div key={f.key} className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
              {isLong ? (
                <Textarea
                  value={value}
                  onChange={(e) => onPatch(section.id, { [f.key]: e.target.value })}
                  rows={3}
                  className="text-xs"
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => onPatch(section.id, { [f.key]: e.target.value })}
                  className="h-8 text-xs"
                />
              )}
            </div>
          );
        })}
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Esta secção não tem campos editáveis.
          </p>
        )}
      </div>
    </div>
  );
});

function humanize(k: string): string {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/(\d+)/, " $1");
}
