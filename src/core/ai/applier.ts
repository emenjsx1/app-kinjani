import { commands } from "@/core/editor/commands";
import type { Project } from "@/core/projects/types";
import { aiOperationSchema } from "./operations";
import type { AIOperation } from "./types";

/**
 * Apply a single AI operation to a project. Validates with Zod first so that
 * malformed agent output cannot corrupt state.
 */
export function applyOperation(project: Project, raw: unknown): Project {
  const parsed = aiOperationSchema.parse(raw) as AIOperation;
  switch (parsed.op) {
    case "setSectionProp":
      return commands.setSectionContent(project, parsed.sectionId, parsed.patch);
    case "addSection":
      return commands.addSection(project, parsed.section);
    case "removeSection":
      return commands.removeSection(project, parsed.sectionId);
    case "reorderSections":
      return commands.reorderSections(project, parsed.orderedIds);
    case "setTheme":
      return commands.setTheme(project, parsed.theme as Partial<Project["theme"]>);
    case "setSettings":
      return commands.setSettings(project, parsed.settings as Partial<Project["settings"]>);
    case "noop":
      return project;
  }
}

export function applyOperations(project: Project, ops: unknown[]): Project {
  return ops.reduce<Project>((p, op) => applyOperation(p, op), project);
}
