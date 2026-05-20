/**
 * FullstackOrchestrator — runs the BackendArchitect + specialist agents
 * to produce a complete FullstackGraph from a user intent.
 *
 * Bridges to the Creative OS bus (Phase F) so the live studio panel shows
 * software-build activity alongside design activity.
 */
import { agentBus, makeMessage } from "@/core/ai/creative-os/AgentCommunicationBus";
import { inferDomain, generateDataGraph, generateAuthFlow, generateApiGraph, generateWorkflowGraph, generateRuntimeGraph } from "./domain";
import { validateSecurity } from "./SecurityAgent";
import type {
  FullstackAgentId,
  FullstackBuildSession,
  FullstackBuildStep,
  FullstackGraph,
} from "./types";

let sid = 0;
const tid = (() => {
  let n = 0;
  return () => `fs_${Date.now()}_${++n}`;
})();

const AGENT_LABEL: Record<FullstackAgentId, string> = {
  "backend-architect": "Backend Architect",
  database: "Database Agent",
  auth: "Auth Agent",
  workflow: "Workflow Agent",
  api: "API Agent",
  security: "Security Agent",
  realtime: "Realtime Agent",
  state: "State Agent",
  "business-logic": "Business Logic Agent",
};

export interface FullstackRunOptions {
  intent: string;
  onUpdate?: (session: FullstackBuildSession) => void;
  signal?: AbortSignal;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Execute the full software-generation pipeline.
 * Each step publishes status to the agent bus so the live timeline updates.
 */
export async function runFullstackBuild(
  opts: FullstackRunOptions,
): Promise<FullstackBuildSession> {
  const session: FullstackBuildSession = {
    id: `fs_session_${Date.now()}_${++sid}`,
    intent: opts.intent,
    startedAt: Date.now(),
    steps: [],
    graph: null,
    status: "planning",
  };

  const addStep = (
    agent: FullstackAgentId,
    label: string,
  ): FullstackBuildStep => {
    const step: FullstackBuildStep = {
      id: tid(),
      agent,
      label,
      status: "pending",
    };
    session.steps.push(step);
    opts.onUpdate?.(session);
    return step;
  };

  const run = async <T,>(
    agent: FullstackAgentId,
    label: string,
    work: () => T | Promise<T>,
    delay = 180,
  ): Promise<T> => {
    const step = addStep(agent, label);
    step.status = "running";
    step.startedAt = Date.now();
    agentBus.publish(makeMessage("creative-director", {
      kind: "status",
      text: `${AGENT_LABEL[agent]}: ${label}`,
    }));
    opts.onUpdate?.(session);
    try {
      await wait(delay + Math.random() * 200);
      const result = await work();
      step.status = "done";
      step.endedAt = Date.now();
      opts.onUpdate?.(session);
      return result;
    } catch (err) {
      step.status = "error";
      step.detail = err instanceof Error ? err.message : "erro";
      step.endedAt = Date.now();
      opts.onUpdate?.(session);
      throw err;
    }
  };

  // 1. Backend Architect — domain + plan
  const domain = await run(
    "backend-architect",
    `Analisando intenção e definindo arquitectura…`,
    () => inferDomain(opts.intent),
  );

  await run(
    "business-logic",
    `Aplicando padrões do domínio "${domain}"…`,
    () => domain,
  );

  session.status = "building";
  opts.onUpdate?.(session);

  // 2. Database
  const data = await run(
    "database",
    `Gerando schema, índices e políticas RLS…`,
    () => generateDataGraph(domain),
  );

  // 3. Auth
  const auth = await run(
    "auth",
    `Configurando signup, login, OAuth e RBAC…`,
    () => generateAuthFlow(domain),
  );

  // 4. API
  const api = await run(
    "api",
    `Gerando endpoints CRUD, validação e rate limiting…`,
    () => generateApiGraph(data),
  );

  // 5. Workflows
  const workflows = await run(
    "workflow",
    `Construindo automações e triggers de negócio…`,
    () => generateWorkflowGraph(domain),
  );

  // 6. Realtime / State
  const runtime = await run(
    "realtime",
    `Activando canais realtime e camadas de cache…`,
    () => generateRuntimeGraph(data),
  );
  await run(
    "state",
    `Mapeando query keys, optimistic updates e sync…`,
    () => runtime.stateBoundaries,
  );

  // 7. Security validation
  session.status = "validating";
  opts.onUpdate?.(session);
  const draft: FullstackGraph = {
    intent: opts.intent,
    domain,
    ui: [],
    data,
    auth,
    api,
    workflows,
    runtime,
    security: { passed: [], warnings: [], errors: [] },
  };
  const security = await run(
    "security",
    `Auditando políticas, permissões e superfícies expostas…`,
    () => validateSecurity(draft),
    260,
  );
  draft.security = security;

  session.graph = draft;
  session.status = "done";
  agentBus.publish(makeMessage("creative-director", {
    kind: "decision",
    text: `Software gerado · ${data.tables.length} tabelas · ${api.endpoints.length} endpoints · ${workflows.workflows.length} workflows`,
  }));
  opts.onUpdate?.(session);
  return session;
}
