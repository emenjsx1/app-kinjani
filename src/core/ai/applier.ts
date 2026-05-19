import { commands } from "@/core/editor/commands";
import type { Project } from "@/core/projects/types";
import { aiOperationSchema } from "./operations";
import type {
  AIOperation,
  AIOperationEnvelope,
  OperationMeta,
  OperationResult,
} from "./types";

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

/* -------------------------------------------------------------------------- */
/*  Envelope-aware applier                                                    */
/* -------------------------------------------------------------------------- */

function isEnvelope(x: unknown): x is AIOperationEnvelope {
  return (
    typeof x === "object" &&
    x !== null &&
    "meta" in x &&
    "op" in x &&
    typeof (x as { meta?: unknown }).meta === "object"
  );
}

/**
 * Compute a best-effort inverse operation that can revert a given op against a
 * given project state. Used by the history engine for selective undo.
 */
function rollbackFor(project: Project, op: AIOperation): AIOperation | undefined {
  switch (op.op) {
    case "setSectionProp": {
      const home = project.pages.find((p) => p.isHomepage) ?? project.pages[0];
      const section = home?.sections.find((s) => s.id === op.sectionId);
      if (!section) return undefined;
      const previous: Record<string, string> = {};
      for (const k of Object.keys(op.patch)) previous[k] = section.content[k] ?? "";
      return { op: "setSectionProp", sectionId: op.sectionId, patch: previous };
    }
    case "addSection":
      return { op: "removeSection", sectionId: op.section.id };
    case "removeSection":
      return undefined; // section data lost; non-rollbackable here
    case "reorderSections": {
      const home = project.pages.find((p) => p.isHomepage) ?? project.pages[0];
      if (!home) return undefined;
      const ordered = home.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s) => s.id);
      return { op: "reorderSections", orderedIds: ordered };
    }
    case "setTheme":
      return { op: "setTheme", theme: { ...project.theme } };
    case "setSettings":
      return { op: "setSettings", settings: { ...project.settings } };
    default:
      return undefined;
  }
}

/**
 * Apply a list of operations or envelopes. Returns per-operation results so
 * callers (history engine, agents) can audit, retry, or rollback selectively.
 */
export function applyOperationEnvelopes(
  project: Project,
  ops: Array<AIOperation | AIOperationEnvelope | unknown>,
): { project: Project; results: OperationResult[] } {
  let current = project;
  const results: OperationResult[] = [];

  for (const item of ops) {
    const envelope: AIOperationEnvelope | null = isEnvelope(item)
      ? (item as AIOperationEnvelope)
      : { meta: defaultMeta(), op: (item as AIOperation) };

    try {
      const rollback = rollbackFor(current, envelope.op);
      const validated = aiOperationSchema.parse(envelope.op) as AIOperation;
      current = applyOperation(current, validated);
      results.push({
        operationId: envelope.meta.operationId,
        ok: true,
        rollbackOp: rollback,
      });
    } catch (err) {
      results.push({
        operationId: envelope.meta.operationId,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { project: current, results };
}

export function defaultMeta(partial: Partial<OperationMeta> = {}): OperationMeta {
  return {
    operationId:
      partial.operationId ?? `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sourceAgent: partial.sourceAgent ?? "system",
    rollbackable: partial.rollbackable ?? true,
    affectedFiles: partial.affectedFiles ?? [],
    affectedComponents: partial.affectedComponents ?? [],
    createdAt: partial.createdAt ?? new Date().toISOString(),
    parentOperationId: partial.parentOperationId,
    operationGroup: partial.operationGroup,
    dependsOn: partial.dependsOn,
    label: partial.label,
  };
}
