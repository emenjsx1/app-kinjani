import { agentBus, makeMessage } from "./AgentCommunicationBus";
import { agentMemoryStore } from "./AgentMemoryStore";
import {
  creativeDirectorAgent,
  planTaskGraph,
} from "./agents/CreativeDirectorAgent";
import { specialistAgents } from "./agents";
import type {
  AgentMessage,
  AgentReview,
  AgentTask,
  CreativeAgent,
  CreativeAgentId,
  OrchestratorSession,
  VisualContextSnapshot,
} from "./types";

const ALL: Record<CreativeAgentId, CreativeAgent> = {
  "creative-director": creativeDirectorAgent,
  layout: specialistAgents[0],
  "art-direction": specialistAgents[1],
  typography: specialistAgents[2],
  color: specialistAgents[3],
  ux: specialistAgents[4],
  motion: specialistAgents[5],
  responsive: specialistAgents[6],
  copy: specialistAgents[7],
  brand: specialistAgents[8],
  "runtime-fix": specialistAgents[9],
};

export interface OrchestratorOptions {
  intent: string;
  visual?: VisualContextSnapshot;
  signal?: AbortSignal;
  onMessage?: (msg: AgentMessage) => void;
  onUpdate?: (session: OrchestratorSession) => void;
}

let sid = 0;

export async function runCreativeSession(
  opts: OrchestratorOptions,
): Promise<OrchestratorSession> {
  const session: OrchestratorSession = {
    id: `session_${Date.now()}_${++sid}`,
    startedAt: Date.now(),
    intent: opts.intent,
    taskGraph: planTaskGraph(opts.intent),
    messages: [],
    reviews: [],
    status: "planning",
  };

  const visual: VisualContextSnapshot = opts.visual ?? {};
  const completed = new Set<string>();

  const publish = (from: CreativeAgentId, payload: Omit<AgentMessage, "id" | "ts" | "from">) => {
    const msg = makeMessage(from, payload);
    session.messages.push(msg);
    agentBus.publish(msg);
    opts.onMessage?.(msg);
    opts.onUpdate?.(session);
  };

  publish("creative-director", {
    kind: "status",
    text: `Sessão criativa iniciada (${session.taskGraph.tasks.length} tarefas).`,
  });
  session.status = "running";
  opts.onUpdate?.(session);

  const runTask = async (task: AgentTask) => {
    const agent = ALL[task.assignedTo];
    if (!agent) return;
    const memory = agentMemoryStore.get(agent.id);
    try {
      const result = await agent.run({
        task,
        visual,
        memory,
        emit: (p) => publish(agent.id, p),
        signal: opts.signal,
      });
      if (result.review) {
        session.reviews.push(result.review);
        if (result.review.issues.length) {
          publish(agent.id, {
            kind: "refinement",
            text: result.review.suggestions[0] ?? "refinamento aplicado",
            meta: { agent: agent.id },
          });
        }
      }
    } catch (err) {
      publish(agent.id, {
        kind: "error",
        text: err instanceof Error ? err.message : "erro desconhecido",
      });
    } finally {
      completed.add(task.id);
    }
  };

  // Topological wave execution: each wave runs tasks whose deps are all done, in parallel.
  let safety = 0;
  while (completed.size < session.taskGraph.tasks.length && safety++ < 20) {
    const wave = session.taskGraph.tasks.filter(
      (t) =>
        !completed.has(t.id) &&
        (t.dependsOn ?? []).every((d) => completed.has(d)),
    );
    if (!wave.length) break;
    await Promise.all(wave.map(runTask));
  }

  session.status = "reviewing";
  opts.onUpdate?.(session);

  const avg =
    session.reviews.reduce((a, r) => a + r.score, 0) /
    Math.max(1, session.reviews.length);
  publish("creative-director", {
    kind: "decision",
    text: `Aprovação final · qualidade média ${(avg * 100).toFixed(0)}/100`,
    meta: { avg },
  });

  session.status = "done";
  opts.onUpdate?.(session);
  return session;
}

export function aggregateReviews(reviews: AgentReview[]) {
  if (!reviews.length) return { score: 0, issues: [] as string[], suggestions: [] as string[] };
  return {
    score: reviews.reduce((a, r) => a + r.score, 0) / reviews.length,
    issues: reviews.flatMap((r) => r.issues),
    suggestions: reviews.flatMap((r) => r.suggestions),
  };
}
