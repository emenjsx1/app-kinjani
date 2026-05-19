/**
 * Forward-looking database schema definitions for the AI Builder runtime.
 * NOT migrated yet — types only. Phase 2+ will introduce these tables.
 */

export interface ProjectVersionRow {
  id: string;
  project_id: string;
  parent_version_id: string | null;
  label: string | null;
  snapshot: unknown; // JSON Project snapshot
  created_by: string;
  created_at: string;
}

export interface ProjectFileRow {
  id: string;
  project_id: string;
  path: string;
  content: string;
  lang: string;
  hash: string;
  updated_at: string;
}

export interface GeneratedComponentRow {
  id: string;
  project_id: string;
  registry_id: string;
  variant: string | null;
  generated_code: string;
  prompt: string | null;
  created_at: string;
}

export interface AIOperationRow {
  id: string;
  project_id: string;
  session_id: string;
  operation: unknown; // discriminated AIOperation
  status: "pending" | "applied" | "rejected" | "errored";
  error: string | null;
  created_at: string;
}

export interface BuilderSessionRow {
  id: string;
  project_id: string;
  user_id: string;
  agent_pipeline: string[];
  started_at: string;
  ended_at: string | null;
}
