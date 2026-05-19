import type { ImportRecord, ImportRecorder } from "../types";
import type { ImportStatement } from "../ast/nodes";

/**
 * Deduplicates and merges import declarations scoped to a single emitted file.
 *
 *  - merges named imports for the same module
 *  - keeps default + type-only imports as distinct entries
 *  - normalizes output to a stable ImportStatement[] for the printer
 */
export class ImportResolver implements ImportRecorder {
  private buckets = new Map<string, ImportRecord>();

  add(record: ImportRecord): void {
    const key = `${record.module}::${record.typeOnly ? "type" : "value"}`;
    const existing = this.buckets.get(key);
    if (!existing) {
      this.buckets.set(key, {
        module: record.module,
        named: record.named ? [...record.named] : undefined,
        defaultImport: record.defaultImport,
        typeOnly: record.typeOnly,
      });
      return;
    }
    if (record.defaultImport && !existing.defaultImport) {
      existing.defaultImport = record.defaultImport;
    }
    if (record.named?.length) {
      existing.named = [
        ...new Set([...(existing.named ?? []), ...record.named]),
      ];
    }
  }

  list(): ImportRecord[] {
    return Array.from(this.buckets.values());
  }

  toStatements(): ImportStatement[] {
    return this.list().map((r) => ({
      module: r.module,
      named: r.named?.length ? [...r.named].sort() : undefined,
      defaultImport: r.defaultImport,
      typeOnly: r.typeOnly,
    }));
  }
}
