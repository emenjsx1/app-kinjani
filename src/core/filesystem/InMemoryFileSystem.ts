import type { FileOperation, FileSystem, FileTree, ProjectFile } from "./types";

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
        break;
      case "update": {
        const existing = this.files.get(op.path);
        if (!existing) throw new Error(`File not found: ${op.path}`);
        this.files.set(op.path, {
          ...existing,
          content: op.content,
          hash: hash(op.content),
        });
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

  static fileFrom(path: string, content: string): ProjectFile {
    return { path, content, lang: inferLang(path), hash: hash(content) };
  }
}
