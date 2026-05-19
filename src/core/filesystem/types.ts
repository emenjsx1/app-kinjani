/**
 * Virtual filesystem types for the future code-generation runtime.
 * Phase 1 ships only types + an in-memory adapter.
 */

export interface ProjectFile {
  path: string;
  content: string;
  lang: string;
  hash: string;
}

export interface ProjectFolder {
  path: string;
  children: Array<ProjectFile | ProjectFolder>;
}

export interface FileTree {
  root: ProjectFolder;
}

export type FileOperation =
  | { op: "create"; file: ProjectFile }
  | { op: "update"; path: string; content: string }
  | { op: "delete"; path: string }
  | { op: "rename"; from: string; to: string }
  | { op: "move"; from: string; to: string };

export interface FileSystem {
  list(): ProjectFile[];
  read(path: string): ProjectFile | null;
  apply(op: FileOperation): void;
  snapshot(): FileTree;
}
