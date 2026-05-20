/**
 * Fullstack OS — type contracts for full software generation.
 * Extends Creative OS (Phase F) with backend, data, workflow, API and runtime graphs.
 */

// ───────────────────────────────────────────────────────────────────────────────
// Unified Fullstack Graph
// ───────────────────────────────────────────────────────────────────────────────

export interface FieldDef {
  name: string;
  type: "uuid" | "text" | "int" | "numeric" | "bool" | "jsonb" | "timestamptz" | "date";
  nullable?: boolean;
  unique?: boolean;
  defaultValue?: string;
  references?: { table: string; column: string; onDelete?: "cascade" | "set null" };
}

export interface TableDef {
  name: string;
  fields: FieldDef[];
  indexes?: string[][];
  rls?: RlsPolicy[];
  realtime?: boolean;
  description?: string;
}

export interface RlsPolicy {
  name: string;
  command: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
  using?: string;
  withCheck?: string;
  roles?: string[];
}

export interface DataGraph {
  tables: TableDef[];
  storageBuckets?: { name: string; public: boolean }[];
  enums?: { name: string; values: string[] }[];
}

export interface AuthFlow {
  signup?: boolean;
  login?: boolean;
  oauth?: ("google" | "apple" | "github")[];
  magicLink?: boolean;
  rbac?: { roles: string[]; defaultRole: string };
  onboarding?: string[];
}

export interface ApiEndpointDef {
  path: string;            // /api/orders/:id
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  edgeFunction?: string;   // edge function name
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  rateLimitPerMin?: number;
  authRequired?: boolean;
  description?: string;
}

export interface ApiGraph {
  endpoints: ApiEndpointDef[];
  edgeFunctions: { name: string; description: string; secrets?: string[] }[];
}

export interface WorkflowTrigger {
  kind: "event" | "schedule" | "manual" | "webhook";
  source?: string;          // event name, cron, webhook path
}

export interface WorkflowStep {
  id: string;
  kind: "condition" | "action" | "notify" | "delay" | "approval" | "callApi" | "mutate";
  config: Record<string, unknown>;
  next?: string[];
}

export interface WorkflowDef {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  description?: string;
}

export interface WorkflowGraph {
  workflows: WorkflowDef[];
}

export interface RealtimeChannel {
  table: string;
  events: ("INSERT" | "UPDATE" | "DELETE")[];
}

export interface RuntimeGraph {
  realtimeChannels: RealtimeChannel[];
  stateBoundaries: {
    client: string[];   // query keys cached on client
    server: string[];   // server-only resources
    optimistic: string[]; // mutations with optimistic updates
  };
}

export interface UiGraphRef { id: string }   // pointer into CompositionGraph

export interface FullstackGraph {
  intent: string;
  domain: string;        // "crm", "marketplace", "saas", "booking", "fintech", ...
  ui: UiGraphRef[];
  data: DataGraph;
  auth: AuthFlow;
  api: ApiGraph;
  workflows: WorkflowGraph;
  runtime: RuntimeGraph;
  security: SecurityReport;
}

export interface SecurityReport {
  passed: string[];
  warnings: string[];
  errors: string[];
}

// ───────────────────────────────────────────────────────────────────────────────
// Generation session
// ───────────────────────────────────────────────────────────────────────────────

export type FullstackAgentId =
  | "backend-architect"
  | "database"
  | "auth"
  | "workflow"
  | "api"
  | "security"
  | "realtime"
  | "state"
  | "business-logic";

export interface FullstackBuildStep {
  id: string;
  agent: FullstackAgentId;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
  startedAt?: number;
  endedAt?: number;
}

export interface FullstackBuildSession {
  id: string;
  intent: string;
  startedAt: number;
  steps: FullstackBuildStep[];
  graph: FullstackGraph | null;
  status: "planning" | "building" | "validating" | "done" | "error";
}
