import { MessageSquare, Brain, Zap, ArrowRight, UserPlus, Target, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_FLOW_CONFIGS, FlowNodeConfig } from "@/lib/agent-templates";

interface AgentFlowVisualProps {
  className?: string;
  agentType?: string;
}

// Mapeamento de ícones por tipo de nó
const NODE_ICONS: Record<string, React.ReactNode> = {
  "input": <MessageSquare className="h-5 w-5" />,
  "process": <Brain className="h-5 w-5" />,
  "action": <Target className="h-5 w-5" />,
  "output": <Zap className="h-5 w-5" />,
};

// Cores por tipo de nó
const NODE_COLORS: Record<string, string> = {
  "input": "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
  "process": "bg-primary/10 text-primary border-primary/30",
  "action": "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  "output": "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
};

// Ícones específicos por ID do nó
const SPECIFIC_NODE_ICONS: Record<string, React.ReactNode> = {
  "Visitante": <UserPlus className="h-5 w-5" />,
  "Lead": <UserPlus className="h-5 w-5" />,
  "Trigger": <Clock className="h-5 w-5" />,
  "Classificação": <Target className="h-5 w-5" />,
  "Reserva": <Calendar className="h-5 w-5" />,
};

// Fluxo padrão para tipos não configurados
const DEFAULT_FLOW: FlowNodeConfig[] = [
  { id: "input", label: "Mensagem", description: "Utilizador envia mensagem", type: "input" },
  { id: "process", label: "Prompt", description: "Agente processa com IA", type: "process" },
  { id: "output", label: "Resposta", description: "Resposta gerada", type: "output" },
];

export function AgentFlowVisual({ className, agentType }: AgentFlowVisualProps) {
  // Obter fluxo específico do tipo ou usar padrão
  const flowNodes = agentType && AGENT_FLOW_CONFIGS[agentType] 
    ? AGENT_FLOW_CONFIGS[agentType] 
    : DEFAULT_FLOW;

  // Determinar quais tipos de nó estão presentes para a legenda
  const nodeTypes = [...new Set(flowNodes.map(n => n.type))];

  const legendItems = [
    { type: "input" as const, label: "Entrada", color: "bg-blue-500/20 border-blue-500/50" },
    { type: "process" as const, label: "Processamento", color: "bg-primary/20 border-primary/50" },
    { type: "action" as const, label: "Ação", color: "bg-amber-500/20 border-amber-500/50" },
    { type: "output" as const, label: "Saída", color: "bg-green-500/20 border-green-500/50" },
  ].filter(item => nodeTypes.includes(item.type));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto py-4">
        {flowNodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-2 md:gap-4">
            {/* Node */}
            <div
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 min-w-[120px] transition-all hover:scale-105",
                NODE_COLORS[node.type]
              )}
            >
              <div className="p-3 rounded-lg bg-background/50">
                {SPECIFIC_NODE_ICONS[node.label] || NODE_ICONS[node.type]}
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{node.label}</p>
                <p className="text-xs opacity-70 mt-1">{node.description}</p>
              </div>
            </div>

            {/* Arrow (except for last node) */}
            {index < flowNodes.length - 1 && (
              <div className="flex items-center text-muted-foreground">
                <div className="h-0.5 w-4 md:w-8 bg-border" />
                <ArrowRight className="h-4 w-4" />
                <div className="h-0.5 w-4 md:w-8 bg-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground flex-wrap">
        {legendItems.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full border", item.color)} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
