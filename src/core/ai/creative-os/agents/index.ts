import type { CreativeAgent, AgentRunResult } from "../types";

/** Heuristic helper: tiny score generator based on graph + intent. */
const baseScore = (intent: string, focus: string): number => {
  const t = intent.toLowerCase();
  return t.includes(focus) ? 0.78 : 0.86;
};

const make = (
  id: CreativeAgent["id"],
  role: CreativeAgent["role"],
  label: string,
  description: string,
  focus: string,
  critique: (intent: string) => string[],
  suggestions: (intent: string) => string[],
): CreativeAgent => ({
  id,
  role,
  label,
  description,
  async run({ task, emit, memory }): Promise<AgentRunResult> {
    emit({ kind: "status", text: `${label} analisando: "${task.intent}"` });
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 220));
    const issues = critique(task.intent);
    const sugg = suggestions(task.intent);
    const score = baseScore(task.intent, focus);
    emit({
      kind: "critique",
      text: `${label}: score ${(score * 100).toFixed(0)} — ${issues[0] ?? "qualidade aceitável"}`,
    });
    memory.shortTerm.unshift(`${id}:${task.intent}`);
    return {
      review: { agent: id, score, issues, suggestions: sugg },
      messages: [issues[0] ?? `${label} aprovado`],
    };
  },
});

export const layoutAgent = make(
  "layout",
  "structure",
  "Layout Agent",
  "Composição, ritmo de espaçamento, organização do graph.",
  "layout",
  () => ["verificar respiração entre secções", "garantir ritmo vertical consistente"],
  () => ["aplicar escala de espaçamento 8/16/32", "agrupar conteúdo relacionado em clusters"],
);

export const artDirectionAgent = make(
  "art-direction",
  "aesthetic",
  "Art Direction Agent",
  "Identidade visual, mood, qualidade cinematográfica.",
  "estilo",
  () => ["reforçar direção emocional", "adicionar profundidade visual"],
  () => ["introduzir gradientes aurora subtis", "elevar com sombra cinemática"],
);

export const typographyAgent = make(
  "typography",
  "aesthetic",
  "Typography Agent",
  "Hierarquia, legibilidade, escala tipográfica.",
  "tipografia",
  () => ["clarificar hierarquia H1→H2→corpo", "validar contraste de pesos"],
  () => ["aplicar escala 1.25 modular", "aumentar tracking em títulos grandes"],
);

export const colorAgent = make(
  "color",
  "aesthetic",
  "Color Agent",
  "Sistemas de paleta, harmonia, contraste.",
  "cor",
  () => ["verificar contraste WCAG AA", "harmonizar acentos com base"],
  () => ["introduzir acento complementar", "reduzir saturação em superfícies"],
);

export const uxAgent = make(
  "ux",
  "interaction",
  "UX Agent",
  "Fluxo, CTAs, usabilidade, conversão.",
  "fluxo",
  () => ["posicionar CTA principal acima da dobra", "reduzir fricção no fluxo"],
  () => ["adicionar prova social próxima do CTA", "simplificar formulário"],
);

export const motionAgent = make(
  "motion",
  "interaction",
  "Motion Agent",
  "Sistemas de animação, transições, hierarquia de movimento.",
  "animação",
  () => ["adicionar transições de entrada suaves", "evitar movimento gratuito"],
  () => ["stagger 60ms entre cards", "easing cubic-bezier(0.22, 1, 0.36, 1)"],
);

export const responsiveAgent = make(
  "responsive",
  "structure",
  "Responsive Agent",
  "Reinterpretação mobile, estratégia de breakpoints.",
  "mobile",
  () => ["reorganizar grid para mobile", "ajustar tamanhos de fonte fluidos"],
  () => ["empilhar colunas <768px", "usar clamp() para tipografia"],
);

export const copyAgent = make(
  "copy",
  "language",
  "Copy Agent",
  "Headlines, CTAs, narrativa emocional.",
  "copy",
  () => ["fortalecer headline com benefício claro", "tornar CTA mais ativo"],
  () => ["substituir 'Saber mais' por verbo de ação", "headline em 8 palavras ou menos"],
);

export const brandAgent = make(
  "brand",
  "aesthetic",
  "Brand Agent",
  "Consistência de tom, identidade coerente.",
  "marca",
  () => ["validar coerência de tom", "manter linguagem visual unificada"],
  () => ["alinhar vocabulário com tom de marca", "reutilizar primitivos visuais"],
);

export const runtimeFixAgent = make(
  "runtime-fix",
  "system",
  "Runtime Fix Agent",
  "Diagnóstico, reparação de graph, ciclos de cura.",
  "fix",
  () => ["procurar nós órfãos no graph", "validar referências"],
  () => ["reparar bindings ausentes", "normalizar IDs duplicados"],
);

export const specialistAgents = [
  layoutAgent,
  artDirectionAgent,
  typographyAgent,
  colorAgent,
  uxAgent,
  motionAgent,
  responsiveAgent,
  copyAgent,
  brandAgent,
  runtimeFixAgent,
];
