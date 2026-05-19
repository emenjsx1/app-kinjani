import type { Project } from "./types";

/**
 * Abstract repository for projects. Phase 1 implementation uses the legacy
 * `useWebsites` hook under the hood; future phases will swap in a persistent
 * project_versions / project_files store.
 */
export interface ProjectRepository {
  load(id: string): Promise<Project | null>;
  save(project: Project): Promise<Project>;
}
