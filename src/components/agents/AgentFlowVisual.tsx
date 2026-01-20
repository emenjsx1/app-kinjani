import { MessageSquare, Brain, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentFlowVisualProps {
  className?: string;
}

interface FlowNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const flowNodes: FlowNode[] = [
  {
    id: "input",
    label: "Mensagem",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Utilizador envia mensagem",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  {
    id: "process",
    label: "Prompt",
    icon: <Brain className="h-5 w-5" />,
    description: "Agente processa com IA",
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "output",
    label: "Resposta",
    icon: <Zap className="h-5 w-5" />,
    description: "Resposta gerada",
    color: "bg-green-500/10 text-green-600 border-green-500/30",
  },
];

export function AgentFlowVisual({ className }: AgentFlowVisualProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto py-4">
        {flowNodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-2 md:gap-4">
            {/* Node */}
            <div
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 min-w-[120px] transition-all hover:scale-105",
                node.color
              )}
            >
              <div className="p-3 rounded-lg bg-background/50">
                {node.icon}
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
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50" />
          <span>Entrada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50" />
          <span>Processamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          <span>Saída</span>
        </div>
      </div>
    </div>
  );
}
