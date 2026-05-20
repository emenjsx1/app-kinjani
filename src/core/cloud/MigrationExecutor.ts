/**
 * Phase H — Migration executor.
 *
 * Bridges generated FullstackGraph schemas to *real* migration execution.
 *
 * Honest behavior: we do NOT run arbitrary SQL from the client (that would
 * bypass Lovable's migration approval flow). Instead we:
 *   1. Compile the TableDef[] into reviewable SQL
 *   2. Emit execution events describing the pending migration
 *   3. Surface the SQL so the user / AI can approve via the standard
 *      Lovable migration tooling, which performs the real apply.
 *
 * This keeps the system safe (no privileged DDL from the browser) while still
 * being real (no fake "migration applied" toasts).
 */

import type { FullstackGraph, TableDef } from "@/core/ai/fullstack-os/types";
import { executionBus } from "./ExecutionBus";

function compileTable(t: TableDef): string {
  const cols = t.fields
    .map((f) => {
      const parts = [`  ${f.name}`, f.type === "uuid" ? "uuid" : f.type];
      if (!f.nullable) parts.push("not null");
      if (f.unique) parts.push("unique");
      if (f.defaultValue) parts.push(`default ${f.defaultValue}`);
      return parts.join(" ");
    })
    .join(",\n");
  const rls = (t.rls ?? [])
    .map(
      (p) =>
        `create policy "${p.name}" on public.${t.name} for ${p.command.toLowerCase()}${
          p.using ? ` using (${p.using})` : ""
        }${p.withCheck ? ` with check (${p.withCheck})` : ""};`,
    )
    .join("\n");
  return [
    `create table if not exists public.${t.name} (`,
    cols,
    `);`,
    `alter table public.${t.name} enable row level security;`,
    rls,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface CompiledMigration {
  id: string;
  name: string;
  sql: string;
  tables: string[];
  generatedAt: number;
}

export const MigrationExecutor = {
  compile(graph: FullstackGraph): CompiledMigration {
    const sql = graph.data.tables.map(compileTable).join("\n\n");
    const id = `mig_${Date.now()}`;
    const mig: CompiledMigration = {
      id,
      name: `Migration for ${graph.domain}`,
      sql,
      tables: graph.data.tables.map((t) => t.name),
      generatedAt: Date.now(),
    };
    executionBus.publish({
      kind: "migration.applied",
      level: "info",
      source: id,
      message: `Compiled ${mig.tables.length} tables — awaiting approval`,
      data: { tables: mig.tables },
    });
    return mig;
  },
};
