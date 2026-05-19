import type { AIOperationEnvelope } from "../types";

export interface PermissionContext {
  /** User can mutate project content. */
  canEditContent: boolean;
  /** User can mutate theme / design tokens. */
  canEditTheme: boolean;
  /** User can add/remove sections. */
  canModifyStructure: boolean;
}

export const defaultPermissions: PermissionContext = {
  canEditContent: true,
  canEditTheme: true,
  canModifyStructure: true,
};

export interface PermissionDecision {
  allowed: AIOperationEnvelope[];
  denied: Array<{ envelope: AIOperationEnvelope; reason: string }>;
}

export const permissions = {
  check(envs: AIOperationEnvelope[], perms: PermissionContext = defaultPermissions): PermissionDecision {
    const allowed: AIOperationEnvelope[] = [];
    const denied: PermissionDecision["denied"] = [];
    for (const env of envs) {
      switch (env.op.op) {
        case "setTheme":
          if (perms.canEditTheme) allowed.push(env);
          else denied.push({ envelope: env, reason: "Theme edits disabled" });
          break;
        case "addSection":
        case "removeSection":
        case "reorderSections":
          if (perms.canModifyStructure) allowed.push(env);
          else denied.push({ envelope: env, reason: "Structural edits disabled" });
          break;
        case "setSectionProp":
        case "setSettings":
          if (perms.canEditContent) allowed.push(env);
          else denied.push({ envelope: env, reason: "Content edits disabled" });
          break;
        default:
          allowed.push(env);
      }
    }
    return { allowed, denied };
  },
};
