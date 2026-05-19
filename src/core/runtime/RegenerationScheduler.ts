/**
 * Debounced, graph-aware regeneration scheduler.
 *
 * Couples a CodegenPipeline to a RuntimeEngine. When the editor state
 * changes, the scheduler computes a minimal patch (graph-aware diff) and
 * pushes it into the runtime — avoiding full reboots.
 *
 * The scheduler is intentionally independent of the underlying engine:
 * it can drive Sandpack today and WebContainer/remote runtimes tomorrow.
 */
import type { Project } from "@/core/projects/types";
import type { CodegenResult, EmittedFile } from "@/core/codegen/types";
import type {
  RuntimeEngine,
  RuntimeFileMap,
  RuntimePatch,
} from "./types";
import { normalize } from "./types";

export interface SchedulerOptions {
  /** Debounce window for incoming regeneration requests. */
  debounceMs?: number;
  /** Generate code for a project. */
  generate: (project: Project) => Promise<CodegenResult>;
  /** Build runtime boot options from a fresh result. */
  bootOptions?: (
    result: CodegenResult,
    project: Project,
  ) => {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    entry?: string;
    env?: Record<string, string>;
  };
}

interface InternalState {
  lastFiles: RuntimeFileMap;
  booted: boolean;
}

export class RegenerationScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingProject: Project | null = null;
  private inflight: Promise<void> | null = null;
  private state: InternalState = { lastFiles: {}, booted: false };

  constructor(
    private engine: RuntimeEngine,
    private opts: SchedulerOptions,
  ) {}

  /** Request a regeneration pass. Coalesces with pending requests. */
  schedule(project: Project): void {
    this.pendingProject = project;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.opts.debounceMs ?? 250);
  }

  /** Force-run any pending regeneration immediately. */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const project = this.pendingProject;
    this.pendingProject = null;
    if (!project) return;

    if (this.inflight) {
      await this.inflight;
      // Re-schedule if newer state came in.
      if (this.pendingProject) return this.flush();
      return;
    }

    this.inflight = this.runOnce(project).finally(() => {
      this.inflight = null;
      if (this.pendingProject) {
        // Newer project arrived during run — coalesce.
        void this.flush();
      }
    });
    await this.inflight;
  }

  async dispose(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pendingProject = null;
    await this.engine.dispose();
    this.state = { lastFiles: {}, booted: false };
  }

  private async runOnce(project: Project): Promise<void> {
    const result = await this.opts.generate(project);
    const nextFiles = filesToMap(result.files);

    if (!this.state.booted) {
      const boot = this.opts.bootOptions?.(result, project) ?? {};
      await this.engine.boot({
        files: nextFiles,
        dependencies: boot.dependencies,
        devDependencies: boot.devDependencies,
        entry: boot.entry,
        env: boot.env,
      });
      this.state.booted = true;
      this.state.lastFiles = nextFiles;
      return;
    }

    const patch = diffFiles(this.state.lastFiles, nextFiles);
    if (patch.upserts && Object.keys(patch.upserts).length === 0) {
      delete patch.upserts;
    }
    if (patch.removes && patch.removes.length === 0) {
      delete patch.removes;
    }
    if (!patch.upserts && !patch.removes) return;
    await this.engine.patch(patch);
    this.state.lastFiles = nextFiles;
  }
}

function filesToMap(files: EmittedFile[]): RuntimeFileMap {
  const out: RuntimeFileMap = {};
  for (const f of files) out[normalize(f.path)] = f.content;
  return out;
}

function diffFiles(prev: RuntimeFileMap, next: RuntimeFileMap): RuntimePatch {
  const upserts: RuntimeFileMap = {};
  const removes: string[] = [];
  for (const [path, content] of Object.entries(next)) {
    if (prev[path] !== content) upserts[path] = content;
  }
  for (const path of Object.keys(prev)) {
    if (!(path in next)) removes.push(path);
  }
  return { upserts, removes };
}
