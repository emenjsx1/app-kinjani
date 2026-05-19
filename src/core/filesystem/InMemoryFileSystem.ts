import type {
  FileDependency,
  FileOperation,
  FileSystem,
  FileTree,
  FileVersion,
  GeneratedArtifact,
  ImportReference,
  ProjectFile,
} from "./types";

function hash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = (h << 5) - h + content.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

function inferLang(path: string): string {
  const ext = path.split(".").pop() ?? "";
  return (
    {
      ts: "typescript",
      tsx: "tsx",
      js: "javascript",
      jsx: "jsx",
      css: "css",
      json: "json",
      md: "markdown",
      html: "html",
    }[ext] ?? "plaintext"
  );
}

export class InMemoryFileSystem implements FileSystem {
  private files = new Map<string, ProjectFile>();
  private versionMap = new Map<string, FileVersion[]>();
  private deps: FileDependency[] = [];
  private artifactList: GeneratedArtifact[] = [];

  list(): ProjectFile[] {
    return Array.from(this.files.values());
  }

  read(path: string): ProjectFile | null {
    return this.files.get(path) ?? null;
  }

  apply(op: FileOperation): void {
    switch (op.op) {
      case "create":
        this.files.set(op.file.path, op.file);
        this.recordVersion(op.file.path, op.file.hash, op.file.generatedBy);
        break;
      case "update": {
        const existing = this.files.get(op.path);
        if (!existing) throw new Error(`File not found: ${op.path}`);
        const next: ProjectFile = {
          ...existing,
          content: op.content,
          hash: hash(op.content),
        };
        this.files.set(op.path, next);
        this.recordVersion(op.path, next.hash, existing.generatedBy);
        break;
      }
      case "delete":
        this.files.delete(op.path);
        break;
      case "rename":
      case "move": {
        const file = this.files.get(op.from);
        if (!file) throw new Error(`File not found: ${op.from}`);
        this.files.delete(op.from);
        this.files.set(op.to, { ...file, path: op.to });
        break;
      }
    }
  }

  snapshot(): FileTree {
    const root = { path: "/", children: [] as Array<ProjectFile> };
    for (const f of this.files.values()) root.children.push(f);
    return { root };
  }

  dependencies(): FileDependency[] {
    return [...this.deps];
  }

  imports(path?: string): ImportReference[] {
    // Phase 2 placeholder; AST tracker will populate this later.
    if (path) return [];
    return [];
  }

  versions(path: string): FileVersion[] {
    return this.versionMap.get(path) ?? [];
  }

  artifacts(): GeneratedArtifact[] {
    return [...this.artifactList];
  }

  /* ---------------------- internal mutation helpers ---------------------- */

  recordArtifact(a: GeneratedArtifact): void {
    this.artifactList.push(a);
  }

  recordDependency(d: FileDependency): void {
    this.deps.push(d);
  }

  private recordVersion(path: string, fileHash: string, agent?: string): void {
    const list = this.versionMap.get(path) ?? [];
    list.push({
      path,
      versionId: `${path}@${fileHash}`,
      hash: fileHash,
      createdAt: new Date().toISOString(),
      authorAgent: agent,
    });
    this.versionMap.set(path, list);
  }

  static fileFrom(path: string, content: string): ProjectFile {
    return { path, content, lang: inferLang(path), hash: hash(content) };
  }
}
