import { useCallback, useEffect, useState } from "react";
import { Download, Package, FileCheck2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExportPipeline } from "@/core/export/ExportPipeline";
import type { ExportResult, ZipBlobResult } from "@/core/export/types";
import type { Project } from "@/core/projects/types";
import { EmptyState, Skeleton } from "../shell";

/**
 * Export Center.
 *
 * Premium export experience built around the Phase 5 ExportPipeline:
 * dependency summary, runtime validation state, history of exports per
 * project, and one-click zip download.
 *
 * History is in-memory (per session) but the shape is identical to what a
 * future persisted history (Supabase) would expose.
 */

export interface ExportHistoryEntry {
  id: string;
  projectId: string;
  projectName: string;
  filename: string;
  sizeBytes: number;
  warnings: string[];
  fileCount: number;
  assetCount: number;
  blob?: Blob;
  createdAt: number;
  status: "ok" | "warning" | "error";
}

const HISTORY_KEY = "phase6:export-history";
const history: ExportHistoryEntry[] = loadHistory();

function loadHistory(): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExportHistoryEntry[];
    return parsed.map((e) => ({ ...e, blob: undefined }));
  } catch {
    return [];
  }
}

function saveHistory() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.map((h) => ({ ...h, blob: undefined }))));
  } catch {
    /* swallow */
  }
}

const listeners = new Set<() => void>();

export function useExportHistory(projectId?: string): ExportHistoryEntry[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return projectId ? history.filter((h) => h.projectId === projectId) : history.slice();
}

export function recordExport(entry: Omit<ExportHistoryEntry, "id" | "createdAt">): ExportHistoryEntry {
  const full: ExportHistoryEntry = {
    ...entry,
    id: `exp_${Date.now().toString(36)}`,
    createdAt: Date.now(),
  };
  history.unshift(full);
  if (history.length > 50) history.pop();
  saveHistory();
  for (const l of listeners) l();
  return full;
}

function clearExport(id: string) {
  const idx = history.findIndex((h) => h.id === id);
  if (idx >= 0) {
    history.splice(idx, 1);
    saveHistory();
    for (const l of listeners) l();
  }
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

interface ExportCenterProps {
  project: Project;
  pipeline?: ExportPipeline;
}

export function ExportCenter({ project, pipeline = new ExportPipeline() }: ExportCenterProps) {
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<ZipBlobResult | null>(null);
  const list = useExportHistory(project.id);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const res = await pipeline.runToZip(project);
      setLastResult(res);
      recordExport({
        projectId: project.id,
        projectName: project.name,
        filename: res.filename,
        sizeBytes: res.sizeBytes,
        warnings: res.warnings,
        fileCount: res.artifacts.length,
        assetCount: res.assets.length,
        blob: res.blob,
        status: res.warnings.length > 0 ? "warning" : "ok",
      });
    } catch (err) {
      recordExport({
        projectId: project.id,
        projectName: project.name,
        filename: "—",
        sizeBytes: 0,
        warnings: [err instanceof Error ? err.message : String(err)],
        fileCount: 0,
        assetCount: 0,
        status: "error",
      });
    } finally {
      setBusy(false);
    }
  }, [pipeline, project]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Exportar projeto</p>
            <p className="text-xs text-muted-foreground">
              Gera um Next.js completo, portável e pronto para deploy.
            </p>
          </div>
        </div>
        <Button onClick={run} disabled={busy} className="gap-2">
          <Download className="h-4 w-4" />
          {busy ? "A gerar…" : "Gerar e descarregar"}
        </Button>
      </div>

      {lastResult && <ExportSummary result={lastResult} />}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Histórico de exportações</h3>
        {busy && <Skeleton className="h-16 w-full" />}
        {!busy && list.length === 0 && (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="Sem exportações ainda"
            description="As exportações deste projeto aparecerão aqui."
          />
        )}
        <ul className="space-y-2">
          {list.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{entry.filename}</p>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {formatTime(entry.createdAt)} · {entry.fileCount} ficheiros · {entry.assetCount} assets ·{" "}
                  {formatBytes(entry.sizeBytes)}
                </p>
                {entry.warnings.length > 0 && (
                  <p className="mt-1 line-clamp-1 text-xs text-warning">
                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                    {entry.warnings[0]}
                    {entry.warnings.length > 1 && ` (+${entry.warnings.length - 1})`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {entry.blob && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => downloadBlob(entry.blob!, entry.filename)}
                    title="Descarregar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => clearExport(entry.id)} title="Remover">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExportSummary({ result }: { result: ExportResult }) {
  const deps = Object.entries((result as ExportResult & { dependencies?: Record<string, string> }).dependencies ?? {});
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileCheck2 className="h-4 w-4 text-success" />
        Pronto para deploy
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Stat label="Ficheiros" value={String(result.artifacts.length)} />
        <Stat label="Assets" value={String(result.assets.length)} />
        <Stat label="Tamanho" value={formatBytes(result.sizeBytes)} />
        <Stat label="Tempo" value={`${result.durationMs}ms`} />
      </div>
      {deps.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {deps.slice(0, 12).map(([name, v]) => (
            <span key={name} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {name}@{v}
            </span>
          ))}
        </div>
      )}
      {result.warnings.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-warning">
            {result.warnings.length} aviso{result.warnings.length === 1 ? "" : "s"}
          </summary>
          <ul className="mt-1 space-y-1 pl-3 text-muted-foreground">
            {result.warnings.slice(0, 8).map((w, i) => (
              <li key={i}>· {w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ExportHistoryEntry["status"] }) {
  const map: Record<ExportHistoryEntry["status"], { label: string; tone: string }> = {
    ok: { label: "OK", tone: "bg-success/15 text-success" },
    warning: { label: "Avisos", tone: "bg-warning/15 text-warning" },
    error: { label: "Falhou", tone: "bg-destructive/15 text-destructive" },
  };
  const m = map[status];
  return <Badge className={cn("h-5 border-0", m.tone)}>{m.label}</Badge>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString("pt-PT");
}

function downloadBlob(blob: Blob, filename: string) {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
