/**
 * Virtual filesystem types for the code-generation runtime.
 *
 * Phase 1 shipped only core types + an in-memory adapter.
 * Phase 2 extends the surface to prepare for:
 *  - file dependency graph (FileDependency)
 *  - import tracking (ImportReference)
 *  - generated artifact mapping (GeneratedArtifact)
 *  - versioned files (FileVersion)
 *  - future AST editing
 *
 * Adapters expose these via optional methods so existing consumers stay
 * unaffected.
 */

export interface ProjectFile {
  path: string;
  content: string;
  lang: string;
  hash: string;
  /** Optional pointer back to the generator/agent that produced the file. */
  generatedBy?: string;
}

export interface ProjectFolder {
  path: string;
  children: Array<ProjectFile | ProjectFolder>;
}

export interface FileTree {
  root: ProjectFolder;
}

export type FileDependencyKind = "import" | "asset" | "style" | "component";

export interface FileDependency {
  from: string;
  to: string;
  kind: FileDependencyKind;
}

export interface ImportReference {
  /** The file containing the import statement. */
  file: string;
  /** Module specifier, e.g. "react" or "./Button". */
  module: string;
  specifiers: string[];
  isDefault?: boolean;
  isTypeOnly?: boolean;
}

export interface GeneratedArtifact {
  id: string;
  sourcePath: string;
  generator: string;
  componentId?: string;
  checksum: string;
  createdAt: string;
}

export interface FileVersion {
  path: string;
  versionId: string;
  hash: string;
  createdAt: string;
  authorAgent?: string;
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

  /** Optional capability surface. Adapters may implement none of these. */
  dependencies?(): FileDependency[];
  imports?(path?: string): ImportReference[];
  versions?(path: string): FileVersion[];
  artifacts?(): GeneratedArtifact[];
}
