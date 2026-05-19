import type { Project, ProjectPage, ProjectSEO } from "./types";

/**
 * Abstract repository for projects. Phase 1 implementation uses the legacy
 * `useWebsites` hook under the hood; future phases will swap in a persistent
 * project_versions / project_files store.
 */
export interface ProjectRepository {
  load(id: string): Promise<Project | null>;
  save(project: Project): Promise<Project>;

  /** Page-level operations (Phase 6+). */
  getPage?(projectId: string, pageId: string): Promise<ProjectPage | null>;
  addPage?(projectId: string, page: ProjectPage): Promise<ProjectPage>;
  updateSeo?(projectId: string, seo: ProjectSEO): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  In-memory stub                                                            */
/* -------------------------------------------------------------------------- */

export class InMemoryProjectRepository implements ProjectRepository {
  private store = new Map<string, Project>();

  async load(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null;
  }

  async save(project: Project): Promise<Project> {
    this.store.set(project.id, project);
    return project;
  }

  async getPage(projectId: string, pageId: string): Promise<ProjectPage | null> {
    const proj = this.store.get(projectId);
    return proj?.pages.find((p) => p.id === pageId) ?? null;
  }

  async addPage(projectId: string, page: ProjectPage): Promise<ProjectPage> {
    const proj = this.store.get(projectId);
    if (!proj) throw new Error(`Project not found: ${projectId}`);
    proj.pages.push(page);
    return page;
  }

  async updateSeo(projectId: string, seo: ProjectSEO): Promise<void> {
    const proj = this.store.get(projectId);
    if (!proj) return;
    proj.seo = { ...proj.seo, ...seo };
  }
}
