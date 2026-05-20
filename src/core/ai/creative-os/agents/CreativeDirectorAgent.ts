import type {
  AgentTask,
  AgentTaskGraph,
  CreativeAgent,
  CreativeAgentId,
} from "../types";

let taskCounter = 0;
const tid = () => `task_${Date.now()}_${++taskCounter}`;

interface IntentSignal {
  agent: CreativeAgentId;
  keywords: RegExp;
  weight: number;
}

const SIGNALS: IntentSignal[] = [
  { agent: "layout", keywords: /(layout|grid|espaç|secç|composiç|estrutura|alinhar)/i, weight: 1 },
  { agent: "typography", keywords: /(fonte|tipograf|título|texto|legibilidade|hierarquia)/i, weight: 1 },
  { agent: "color", keywords: /(cor|palet|gradient|contraste|tom)/i, weight: 1 },
  { agent: "art-direction", keywords: /(estilo|mood|estética|premium|cinematográf|visual)/i, weight: 1 },
  { agent: "ux", keywords: /(cta|botão|fluxo|conversão|usabilidade|onboarding)/i, weight: 1 },
  { agent: "motion", keywords: /(animaç|transiç|movimento|interaç|hover)/i, weight: 0.9 },
  { agent: "responsive", keywords: /(mobile|tablet|responsiv|breakpoint)/i, weight: 1 },
  { agent: "copy", keywords: /(texto|copy|headline|título|narrativa|escrever)/i, weight: 0.9 },
  { agent: "brand", keywords: /(marca|identidade|brand|coerência)/i, weight: 1 },
  { agent: "runtime-fix", keywords: /(bug|erro|fix|reparar|partido|broken)/i, weight: 1.2 },
];

/**
 * CreativeDirectorAgent — central orchestration intelligence.
 * Breaks intent → task graph, assigns specialists, enforces review cycle.
 */
export const creativeDirectorAgent: CreativeAgent = {
  id: "creative-director",
  role: "orchestrator",
  label: "Creative Director",
  description: "Coordena o estúdio de agentes, define direção e aprova entregas.",
  async run({ task, emit, memory }) {
    emit({
      kind: "status",
      text: `Creative Director a interpretar intenção: "${task.intent}"`,
    });
    memory.project.unshift(task.intent);
    return {
      messages: [`Direção criativa definida para: ${task.intent}`],
      review: {
        agent: "creative-director",
        score: 0.92,
        issues: [],
        suggestions: ["manter coerência entre agentes"],
      },
    };
  },
};

/** Build a deterministic task graph from a user prompt. */
export function planTaskGraph(intent: string): AgentTaskGraph {
  const matched = SIGNALS
    .map((s) => ({ s, hit: s.keywords.test(intent) }))
    .filter((x) => x.hit)
    .map((x) => x.s.agent);

  // Always include a baseline review crew so the studio feels alive.
  const baseline: CreativeAgentId[] = [
    "layout",
    "art-direction",
    "typography",
    "color",
    "ux",
  ];

  const unique = Array.from(new Set([...matched, ...baseline]));

  // Director kicks off, specialists run in parallel, responsive + motion refine,
  // copy/brand finalize, director approves.
  const directorId = tid();
  const specialistTasks: AgentTask[] = unique
    .filter((a) => a !== "responsive" && a !== "motion" && a !== "copy" && a !== "brand")
    .map((agent) => ({
      id: tid(),
      assignedTo: agent,
      intent,
      dependsOn: [directorId],
    }));

  const refinementAgents: CreativeAgentId[] = ["responsive", "motion"];
  const refinementTasks: AgentTask[] = refinementAgents.map((agent) => ({
    id: tid(),
    assignedTo: agent,
    intent,
    dependsOn: specialistTasks.map((t) => t.id),
  }));

  const finishAgents: CreativeAgentId[] = ["copy", "brand"];
  const finishTasks: AgentTask[] = finishAgents.map((agent) => ({
    id: tid(),
    assignedTo: agent,
    intent,
    dependsOn: refinementTasks.map((t) => t.id),
  }));

  const approval: AgentTask = {
    id: tid(),
    assignedTo: "creative-director",
    intent: `Aprovação final: ${intent}`,
    dependsOn: [...finishTasks, ...refinementTasks, ...specialistTasks].map((t) => t.id),
  };

  return {
    intent,
    tasks: [
      { id: directorId, assignedTo: "creative-director", intent },
      ...specialistTasks,
      ...refinementTasks,
      ...finishTasks,
      approval,
    ],
  };
}
