import { 
  MessageSquare, Brain, Zap, ArrowRight, UserPlus, Target, Clock, Calendar,
  FileSpreadsheet, Mail, Phone, Search, Filter, Send, CheckCircle2, Webhook,
  Database, Bell, BarChart3, Settings2
} from "lucide-react";
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

// Ícones específicos por ID ou label do nó
const SPECIFIC_NODE_ICONS: Record<string, React.ReactNode> = {
  // Inputs
  "Visitante": <UserPlus className="h-5 w-5" />,
  "Lead": <UserPlus className="h-5 w-5" />,
  "Trigger": <Clock className="h-5 w-5" />,
  "trigger": <Clock className="h-5 w-5" />,
  "Schedule": <Clock className="h-5 w-5" />,
  "WhatsApp": <Phone className="h-5 w-5" />,
  "whatsapp": <Phone className="h-5 w-5" />,
  "Webhook": <Webhook className="h-5 w-5" />,
  
  // Processing
  "Memória": <Database className="h-5 w-5" />,
  "memory": <Database className="h-5 w-5" />,
  "IA Agent": <Brain className="h-5 w-5" />,
  "Formatar": <Settings2 className="h-5 w-5" />,
  "format": <Settings2 className="h-5 w-5" />,
  "Filtro": <Filter className="h-5 w-5" />,
  "filter": <Filter className="h-5 w-5" />,
  "Validar": <CheckCircle2 className="h-5 w-5" />,
  "validate": <CheckCircle2 className="h-5 w-5" />,
  "Transformar": <Settings2 className="h-5 w-5" />,
  "Configurar": <Settings2 className="h-5 w-5" />,
  "config": <Settings2 className="h-5 w-5" />,
  "Processar": <Brain className="h-5 w-5" />,
  "Template": <FileSpreadsheet className="h-5 w-5" />,
  "Verificar": <CheckCircle2 className="h-5 w-5" />,
  "check": <CheckCircle2 className="h-5 w-5" />,
  
  // Actions
  "Google Sheets": <FileSpreadsheet className="h-5 w-5" />,
  "sheets": <FileSpreadsheet className="h-5 w-5" />,
  "Google Maps": <Search className="h-5 w-5" />,
  "search": <Search className="h-5 w-5" />,
  "Captura": <Target className="h-5 w-5" />,
  "Score": <BarChart3 className="h-5 w-5" />,
  "Reservar": <Calendar className="h-5 w-5" />,
  "reserve": <Calendar className="h-5 w-5" />,
  "Calendar": <Calendar className="h-5 w-5" />,
  "calendar": <Calendar className="h-5 w-5" />,
  "Resend API": <Mail className="h-5 w-5" />,
  "send": <Send className="h-5 w-5" />,
  "Gmail": <Mail className="h-5 w-5" />,
  "gmail": <Mail className="h-5 w-5" />,
  "Contacts": <UserPlus className="h-5 w-5" />,
  "contacts": <UserPlus className="h-5 w-5" />,
  "Atualizar": <CheckCircle2 className="h-5 w-5" />,
  "update": <CheckCircle2 className="h-5 w-5" />,
  "Log": <FileSpreadsheet className="h-5 w-5" />,
  "log": <FileSpreadsheet className="h-5 w-5" />,
  "API Externa": <Webhook className="h-5 w-5" />,
  
  // Outputs
  "Confirmação": <CheckCircle2 className="h-5 w-5" />,
  "confirm": <CheckCircle2 className="h-5 w-5" />,
  "Relatório": <BarChart3 className="h-5 w-5" />,
  "report": <BarChart3 className="h-5 w-5" />,
  "Notificar": <Bell className="h-5 w-5" />,
  "notify": <Bell className="h-5 w-5" />,
  "Notificação": <Bell className="h-5 w-5" />,
  "Resposta": <MessageSquare className="h-5 w-5" />,
};

// Fluxo padrão para tipos não configurados
const DEFAULT_FLOW: FlowNodeConfig[] = [
  { id: "input", label: "Mensagem", description: "Utilizador envia mensagem", type: "input" },
  { id: "memory", label: "Memória", description: "Contexto da conversa", type: "process" },
  { id: "process", label: "IA Agent", description: "Processa com LLM", type: "process" },
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
    { type: "action" as const, label: "Ação/Integração", color: "bg-amber-500/20 border-amber-500/50" },
    { type: "output" as const, label: "Saída", color: "bg-green-500/20 border-green-500/50" },
  ].filter(item => nodeTypes.includes(item.type));

  // Get icon for a node
  const getNodeIcon = (node: FlowNodeConfig) => {
    return SPECIFIC_NODE_ICONS[node.label] || SPECIFIC_NODE_ICONS[node.id] || NODE_ICONS[node.type];
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-start gap-2 md:gap-3 overflow-x-auto py-4 px-2">
        {flowNodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Node */}
            <div
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 min-w-[100px] max-w-[120px] transition-all hover:scale-105",
                NODE_COLORS[node.type]
              )}
            >
              <div className="p-2 rounded-lg bg-background/50">
                {getNodeIcon(node)}
              </div>
              <div className="text-center">
                <p className="font-semibold text-xs">{node.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5 line-clamp-2">{node.description}</p>
              </div>
            </div>

            {/* Arrow (except for last node) */}
            {index < flowNodes.length - 1 && (
              <div className="flex items-center text-muted-foreground flex-shrink-0">
                <div className="h-0.5 w-3 md:w-6 bg-border" />
                <ArrowRight className="h-3 w-3" />
                <div className="h-0.5 w-3 md:w-6 bg-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 text-xs text-muted-foreground flex-wrap">
        {legendItems.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full border", item.color)} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Integration badges */}
      {agentType && AGENT_FLOW_CONFIGS[agentType] && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {flowNodes.some(n => n.label.includes("Sheets") || n.id === "sheets") && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
              📊 Google Sheets
            </span>
          )}
          {flowNodes.some(n => n.label === "WhatsApp" || n.id === "whatsapp" || n.id === "send") && (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
              💬 WhatsApp
            </span>
          )}
          {flowNodes.some(n => n.label.includes("Gmail") || n.label.includes("Resend") || n.id === "gmail") && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/30">
              📧 Email
            </span>
          )}
          {flowNodes.some(n => n.label.includes("Maps") || n.id === "search") && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/30">
              🗺️ Google Maps
            </span>
          )}
          {flowNodes.some(n => n.label === "Calendar" || n.id === "calendar") && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/30">
              📅 Calendar
            </span>
          )}
          {flowNodes.some(n => n.label === "Memória" || n.id === "memory") && (
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
              🧠 Memória
            </span>
          )}
        </div>
      )}
    </div>
  );
}