/**
 * Security agent — static validation pass over the generated fullstack graph.
 */
import type { FullstackGraph, SecurityReport, TableDef } from "./types";

export function validateSecurity(graph: FullstackGraph): SecurityReport {
  const passed: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const check = (cond: boolean, msg: string, level: "pass" | "warn" | "error" = "pass") => {
    if (cond) passed.push(msg);
    else (level === "error" ? errors : warnings).push(msg);
  };

  // RLS coverage
  graph.data.tables.forEach((t: TableDef) => {
    const hasRls = (t.rls?.length ?? 0) > 0;
    check(hasRls, `RLS habilitado em ${t.name}`, "error");
    const ownership = t.rls?.some((p) => /auth\.uid\(\)/.test(p.using ?? "") || /auth\.uid\(\)/.test(p.withCheck ?? ""));
    check(!!ownership, `Política de propriedade em ${t.name}`, "warn");
  });

  // Auth sanity
  check(!!graph.auth.signup && !!graph.auth.login, "Fluxos signup/login configurados", "error");
  check((graph.auth.rbac?.roles.length ?? 0) > 0, "RBAC com pelo menos um role", "warn");

  // API protection
  const unprotected = graph.api.endpoints.filter((e) => !e.authRequired);
  check(unprotected.length === 0, "Todos os endpoints exigem auth", "warn");
  const noRateLimit = graph.api.endpoints.filter((e) => !e.rateLimitPerMin);
  check(noRateLimit.length === 0, "Rate limiting aplicado", "warn");

  return { passed, warnings, errors };
}
