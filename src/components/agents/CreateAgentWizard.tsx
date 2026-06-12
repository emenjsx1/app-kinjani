import { useState, useEffect } from "react";
import { Bot, MessageSquare, Users, Sparkles, Calendar, ArrowRight, CheckCircle2, FileText, Wand2, Coins, Loader2, Webhook, Link2, Server, ExternalLink, Globe, ToggleLeft, ToggleRight, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROMPT_TEMPLATES, getTemplatesForAgentType, PromptTemplate } from "@/lib/agent-templates";
import { useAgentAI } from "@/hooks/useAgentAI";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  type: string;
  typeId: string;
  prompt: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
  instanceId?: string | null;
}

interface CreateAgentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: (agent: Agent) => void;
}

const STEPS = ["Método", "Tipo", "Template", "Prompt", "Nome", "Conexões", "Canal", "Concluído"];
const AI_STEPS = ["Método", "IA", "A Gerar...", "Nome", "Canal", "Concluído"];

type AgentTypeDef = {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  category: "conversational" | "automation";
  comingSoon?: boolean;
};

const AGENT_TYPES: AgentTypeDef[] = [
  { id: "atendimento-faq", title: "Atendimento / FAQ", description: "Responde dúvidas frequentes e atende clientes", icon: <MessageSquare className="h-5 w-5" />, category: "conversational" },
  { id: "captura-leads", title: "Captura de Leads", description: "Captura contactos numa conversa natural", icon: <Users className="h-5 w-5" />, category: "conversational" },
  { id: "qualificacao", title: "Qualificação", description: "Qualifica leads como Hot, Warm ou Cold via conversa", icon: <Sparkles className="h-5 w-5" />, category: "conversational" },
  { id: "follow-up", title: "Follow-up", description: "Mensagens de seguimento personalizadas", icon: <ArrowRight className="h-5 w-5" />, category: "conversational" },
  { id: "scrapper-leads", title: "Scrapper de Leads", description: "Pesquisa empresas e gera lista de contactos", icon: <Users className="h-5 w-5" />, category: "automation" },
  { id: "disparo-whatsapp", title: "Disparo WhatsApp", description: "Envia mensagens em massa com controlo de limites", icon: <MessageSquare className="h-5 w-5" />, category: "automation" },
  { id: "disparo-email", title: "Disparo de Email", description: "Envia campanhas de email em massa", icon: <FileText className="h-5 w-5" />, category: "automation" },
  { id: "agendamento", title: "Agendamento", description: "Recolhe pedidos de marcação e regista agendamentos", icon: <Calendar className="h-5 w-5" />, category: "automation" },
  { id: "controlo-gastos", title: "Controlo de Gastos", description: "Regista despesas e devolve resumos do orçamento", icon: <Coins className="h-5 w-5" />, category: "automation" },
  { id: "gmail-contacts", title: "Gmail → Contactos", description: "Extrai remetentes do Gmail para contactos (requer Google)", icon: <Users className="h-5 w-5" />, category: "automation", comingSoon: true },
];

const CHANNEL_OPTIONS = [
  { id: "embed", title: "Website Embed", description: "Incorpora o widget de chat no seu site", icon: <Bot className="h-5 w-5" /> },
  { id: "whatsapp", title: "WhatsApp", description: "Liga a uma instância WhatsApp conectada", icon: <MessageSquare className="h-5 w-5" /> },
];

const CREATION_METHODS = [
  { id: "manual", title: "Criar Manualmente", description: "Escolha tipo, template e personalize o prompt", icon: <FileText className="h-5 w-5" /> },
  { id: "ai", title: "Criar com IA", description: "Descreva o que quer e a IA cria o agente", icon: <Wand2 className="h-5 w-5" />, badge: "2 créditos" },
];

export function CreateAgentWizard({ open, onOpenChange, onAgentCreated }: CreateAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai" | null>(null);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [agentName, setAgentName] = useState("");
  const [channel, setChannel] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // Connection settings
  const [webhookUrl, setWebhookUrl] = useState("");
  const [mcpServerUrl, setMcpServerUrl] = useState("");
  const [enableGoogleCalendar, setEnableGoogleCalendar] = useState(false);
  const [enableGoogleSheets, setEnableGoogleSheets] = useState(false);
  const [enableGmail, setEnableGmail] = useState(false);

  // AI creation state
  const [aiDescription, setAiDescription] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [generatedAgent, setGeneratedAgent] = useState<{
    name: string;
    type: string;
    typeLabel: string;
    prompt: string;
    description: string;
  } | null>(null);

  const { createAgentWithAI, isCreating: isAICreating } = useAgentAI();
  const { instances } = useWhatsAppInstances();

  const availableTemplates = agentType ? getTemplatesForAgentType(agentType) : [];

  const resetWizard = () => {
    setCurrentStep(0);
    setCreationMethod(null);
    setAgentType(null);
    setSelectedTemplate(null);
    setPrompt("");
    setAgentName("");
    setChannel(null);
    setSelectedInstanceId(null);
    setAiDescription("");
    setBusinessName("");
    setNiche("");
    setGeneratedAgent(null);
    setWebhookUrl("");
    setMcpServerUrl("");
    setEnableGoogleCalendar(false);
    setEnableGoogleSheets(false);
    setEnableGmail(false);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const getSteps = () => {
    return creationMethod === "ai" ? AI_STEPS : STEPS;
  };

  const handleNext = async () => {
    // AI path - generate agent
    if (creationMethod === "ai" && currentStep === 1) {
      setCurrentStep(2); // Show "generating" step
      
      const result = await createAgentWithAI({
        description: aiDescription,
        businessName,
        niche,
      });

      if (result.success && result.agent) {
        setGeneratedAgent(result.agent);
        setAgentName(result.agent.name);
        setPrompt(result.agent.prompt);
        toast.success(`Agente gerado com IA (${result.creditsUsed} créditos usados)`);
        setCurrentStep(3); // Go to name step
      } else {
        toast.error(result.error || "Erro ao criar agente com IA");
        setCurrentStep(1); // Go back to AI input
      }
      return;
    }

    if (currentStep < getSteps().length - 1) {
      if (creationMethod === "manual" && currentStep === 2 && selectedTemplate) {
        setPrompt(selectedTemplate.prompt);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (creationMethod === "ai" && currentStep === 3) setGeneratedAgent(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setCurrentStep(3); 
  };

  const handleCreate = () => {
    const selectedType = AGENT_TYPES.find((t) => t.id === agentType);
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentName,
      type: generatedAgent?.typeLabel || selectedType?.title || "Personalizado",
      typeId: generatedAgent?.type || agentType || "custom",
      prompt: prompt,
      status: "active",
      channel: channel as "embed" | "whatsapp" | "both",
      messagesHandled: 0,
      createdAt: new Date().toISOString().split("T")[0],
      instanceId: channel === "whatsapp" ? selectedInstanceId : null,
    };
    onAgentCreated(newAgent);
    handleNext(); 
  };

  const canProceed = () => {
    if (creationMethod === "ai") {
      switch (currentStep) {
        case 0: return creationMethod !== null;
        case 1: return aiDescription.trim().length > 10 && businessName.trim().length > 2;
        case 2: return false; // Generating
        case 3: return agentName.trim().length > 2;
        case 4: return channel !== null && (channel !== "whatsapp" || selectedInstanceId !== null);
        default: return true;
      }
    } else {
      switch (currentStep) {
        case 0: return creationMethod !== null;
        case 1: return agentType !== null;
        case 2: return true; 
        case 3: return prompt.trim().length > 10;
        case 4: return agentName.trim().length > 2;
        case 5: return true; 
        case 6: return channel !== null && (channel !== "whatsapp" || selectedInstanceId !== null);
        default: return true;
      }
    }
  };

  const getFinalStepIndex = () => creationMethod === "ai" ? 5 : 7;
  const getCreateStepIndex = () => creationMethod === "ai" ? 4 : 6;

  // Custom Animated Stepper Component
  const AnimatedStepper = () => {
    const stepsList = getSteps();
    return (
      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-forest/20 rounded-full z-0"></div>
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-emerald-500 to-[#45fd94] rounded-full z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / (stepsList.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {stepsList.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "#45fd94" : isCurrent ? "#021f1b" : "#021f1b",
                  borderColor: isCompleted ? "#45fd94" : isCurrent ? "#45fd94" : "rgba(69, 253, 148, 0.2)",
                  color: isCompleted ? "#011612" : isCurrent ? "#45fd94" : "rgba(69, 253, 148, 0.5)",
                  boxShadow: isCurrent ? "0 0 15px rgba(69,253,148,0.4)" : "none",
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  isCompleted && "bg-[#45fd94] border-[#45fd94] text-[#011612]",
                  isCurrent && "bg-[#021f1b] border-[#45fd94] text-[#45fd94]",
                  !isCompleted && !isCurrent && "bg-[#021f1b] border-forest/30 text-pistachio/50"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </motion.div>
              <span className={cn(
                "absolute -bottom-6 text-[10px] font-medium text-center w-20 transition-colors duration-300",
                isCurrent ? "text-[#45fd94] font-bold" : "text-pistachio/50"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep = () => {
    // Passo 0: Método
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-[#45fd94]/10 rounded-2xl border border-[#45fd94]/20 mb-2">
              <Sparkles className="h-6 w-6 text-[#45fd94]" />
            </div>
            <h3 className="text-2xl font-bold text-white font-display">Como quer criar o seu Agente?</h3>
            <p className="text-sm text-pistachio/70">Escolha o método ideal para a sua necessidade</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREATION_METHODS.map((method) => (
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={method.id}
                className={cn(
                  "p-5 rounded-xl cursor-pointer transition-all border backdrop-blur-md relative overflow-hidden group",
                  creationMethod === method.id
                    ? "bg-[#45fd94]/10 border-[#45fd94] shadow-[0_0_20px_rgba(69,253,148,0.2)]"
                    : "bg-[#021f1b]/60 border-forest/30 hover:border-[#45fd94]/50"
                )}
                onClick={() => setCreationMethod(method.id as "manual" | "ai")}
              >
                {creationMethod === method.id && (
                  <motion.div layoutId="method-active" className="absolute inset-0 bg-gradient-to-br from-[#45fd94]/5 to-transparent z-0" />
                )}
                <div className="flex items-start gap-4 relative z-10">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    creationMethod === method.id ? "bg-[#45fd94]/20 text-[#45fd94]" : "bg-forest/20 text-pistachio/70 group-hover:text-[#45fd94]"
                  )}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("font-bold", creationMethod === method.id ? "text-white" : "text-pistachio")}>{method.title}</h4>
                      {method.badge && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] uppercase tracking-wider">
                          <Coins className="h-3 w-3 mr-1" />{method.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-pistachio/60">{method.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    // AI Creation Path
    if (creationMethod === "ai") {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-[#45fd94]" /> Descreva o seu Agente
                </h3>
                <p className="text-sm text-pistachio/70 mt-1">A Inteligência Artificial criará um agente perfeito baseado no seu pedido.</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-200">A geração deste agente inteligente consome 2 créditos da sua conta.</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-pistachio/60">Nome da Empresa</Label>
                    <Input placeholder="Ex: Clínica São João" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-[#021f1b]/60 border-forest/30 text-white h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-pistachio/60">Nicho / Setor</Label>
                    <Input placeholder="Ex: Saúde, Imobiliária" value={niche} onChange={e => setNiche(e.target.value)} className="bg-[#021f1b]/60 border-forest/30 text-white h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-pistachio/60">O que o Agente deve fazer?</Label>
                  <Textarea placeholder="Descreva as tarefas. Ex: Quero um agente que responda perguntas sobre os nossos serviços médicos, marque consultas e capte leads..." value={aiDescription} onChange={e => setAiDescription(e.target.value)} className="bg-[#021f1b]/60 border-forest/30 text-white min-h-[140px] resize-none" />
                </div>
              </div>
            </div>
          );

        case 2:
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#45fd94] blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-[#45fd94] relative z-10" />
                <Sparkles className="h-6 w-6 text-white absolute -top-2 -right-2 animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-emerald-400 to-[#45fd94] bg-clip-text text-transparent">Kinjani AI a processar...</h3>
                <p className="text-sm text-pistachio/60">A analisar a sua empresa e a desenhar as instruções perfeitas.</p>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex gap-4 items-start">
                <div className="p-2 bg-emerald-500/20 rounded-full mt-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Agente Criado com Sucesso!</h4>
                  <p className="text-sm text-emerald-200/70 mt-1">{generatedAgent?.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-pistachio/60">Nome do Agente</Label>
                  <Input value={agentName} onChange={e => setAgentName(e.target.value)} className="bg-[#021f1b]/60 border-[#45fd94]/30 text-white text-lg font-bold h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-pistachio/60">Instruções Geradas (Prompt)</Label>
                  <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="bg-[#021f1b]/60 border-forest/30 text-[#45fd94]/90 min-h-[180px] font-mono text-xs leading-relaxed" />
                  <p className="text-[10px] text-pistachio/50">Pode afinar estas instruções manualmente se desejar.</p>
                </div>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Canal de Comunicação</h3>
                <p className="text-sm text-pistachio/70 mt-1">Onde pretende que o agente responda aos clientes?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CHANNEL_OPTIONS.map(opt => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={opt.id}
                    className={cn(
                      "p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden",
                      channel === opt.id ? "bg-[#45fd94]/10 border-[#45fd94]" : "bg-[#021f1b]/60 border-forest/30"
                    )}
                    onClick={() => { setChannel(opt.id); if (opt.id !== "whatsapp") setSelectedInstanceId(null); }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("p-2 rounded-lg", channel === opt.id ? "bg-[#45fd94] text-[#011612]" : "bg-forest/20 text-pistachio")}>
                        {opt.icon}
                      </div>
                      <h4 className={cn("font-bold", channel === opt.id ? "text-white" : "text-pistachio")}>{opt.title}</h4>
                    </div>
                    <p className="text-xs text-pistachio/60">{opt.description}</p>
                  </motion.div>
                ))}
              </div>
              {channel === "whatsapp" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 p-4 bg-forest/10 border border-forest/20 rounded-xl mt-4">
                  <Label className="text-xs uppercase tracking-wider text-pistachio/60">Selecione a Instância WhatsApp</Label>
                  {instances.length === 0 ? (
                    <p className="text-xs text-amber-400">Nenhuma instância disponível. Crie uma em Integrações.</p>
                  ) : (
                    <Select value={selectedInstanceId || ""} onValueChange={setSelectedInstanceId}>
                      <SelectTrigger className="bg-[#021f1b]/60 border-forest/30 text-white">
                        <SelectValue placeholder="Selecione uma instância..." />
                      </SelectTrigger>
                      <SelectContent>
                        {instances.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.instance_name} {inst.status === "connected" ? "✓" : "(desconectado)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>
              )}
            </div>
          );

        case 5:
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", bounce: 0.5 }} className="h-20 w-20 rounded-full bg-[#45fd94]/20 flex items-center justify-center border-2 border-[#45fd94]">
                <CheckCircle2 className="h-10 w-10 text-[#45fd94]" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Pronto a Operar!</h3>
                <p className="text-pistachio/70">O agente <span className="text-[#45fd94] font-bold">{agentName}</span> foi criado com sucesso via IA.</p>
              </div>
            </div>
          );
      }
    }

    // Manual Creation Path
    switch (currentStep) {
      case 1: {
        const conversational = AGENT_TYPES.filter(t => t.category === "conversational");
        const automation = AGENT_TYPES.filter(t => t.category === "automation");

        const renderCard = (type: AgentTypeDef) => {
          const disabled = !!type.comingSoon;
          const selected = agentType === type.id;
          return (
            <motion.button
              whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              key={type.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setAgentType(type.id)}
              className={cn(
                "text-left p-4 rounded-xl transition-all border relative overflow-hidden group",
                disabled ? "opacity-40 cursor-not-allowed border-forest/20 bg-black/20" : selected ? "bg-[#45fd94]/10 border-[#45fd94]" : "bg-[#021f1b]/60 border-forest/30 hover:border-[#45fd94]/50"
              )}
            >
              <div className="flex items-start gap-3 relative z-10">
                <div className={cn("p-2 rounded-lg shrink-0 transition-colors", selected ? "bg-[#45fd94]/20 text-[#45fd94]" : "bg-forest/20 text-pistachio group-hover:text-[#45fd94]")}>{type.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn("font-bold text-sm", selected ? "text-white" : "text-pistachio group-hover:text-white")}>{type.title}</h4>
                    {disabled && <Badge variant="outline" className="text-[9px] border-forest/30 text-pistachio/50">Em breve</Badge>}
                  </div>
                  <p className="text-[10px] text-pistachio/60 leading-tight">{type.description}</p>
                </div>
              </div>
            </motion.button>
          );
        };

        return (
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-8 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Categoria do Agente</h3>
                <p className="text-sm text-pistachio/70 mt-1">Qual será o foco principal das suas tarefas?</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-[#45fd94]" />
                  <h4 className="font-bold text-white">Conversacionais</h4>
                  <div className="h-[1px] flex-1 bg-forest/20 ml-2"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">{conversational.map(renderCard)}</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-5 w-5 text-violet-400" />
                  <h4 className="font-bold text-white">Automação de Tarefas</h4>
                  <div className="h-[1px] flex-1 bg-forest/20 ml-2"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">{automation.map(renderCard)}</div>
              </div>
            </div>
          </ScrollArea>
        );
      }

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Templates (Opcional)</h3>
              <p className="text-sm text-pistachio/70 mt-1">Acelere a criação usando instruções pré-configuradas.</p>
            </div>
            {availableTemplates.length > 0 ? (
              <ScrollArea className="max-h-[350px] pr-4">
                <div className="space-y-3">
                  {availableTemplates.map((template) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={template.id}
                      className={cn(
                        "p-4 rounded-xl cursor-pointer transition-all border group",
                        selectedTemplate?.id === template.id ? "bg-[#45fd94]/10 border-[#45fd94]" : "bg-[#021f1b]/60 border-forest/30 hover:border-[#45fd94]/50"
                      )}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg", selectedTemplate?.id === template.id ? "bg-[#45fd94] text-[#011612]" : "bg-forest/20 text-[#45fd94]")}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={cn("font-bold text-sm", selectedTemplate?.id === template.id ? "text-white" : "text-pistachio")}>{template.name}</h4>
                            <Badge className="bg-forest/20 text-pistachio border border-forest/30 text-[9px] hover:bg-forest/30">
                              {template.nicheLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-pistachio/60 mt-1 leading-snug">{template.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 border border-dashed border-forest/30 rounded-xl bg-black/20">
                <FileText className="h-10 w-10 mx-auto mb-3 text-pistachio/30" />
                <p className="text-pistachio/70 text-sm">Sem templates disponíveis para este tipo.</p>
              </div>
            )}
            <Button variant="ghost" onClick={handleSkipTemplate} className="w-full text-[#45fd94] hover:bg-[#45fd94]/10 hover:text-[#45fd94]">
              Criar instruções do zero <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Comportamento (Prompt)</h3>
              <p className="text-sm text-pistachio/70 mt-1">Instrua o seu agente sobre a sua personalidade e regras.</p>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Você é um assistente de apoio ao cliente da [Nome da Empresa]. Ajuda os utilizadores com..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[250px] font-mono text-sm bg-[#021f1b]/60 border-forest/30 text-[#45fd94] focus:border-[#45fd94]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Identidade do Agente</h3>
              <p className="text-sm text-pistachio/70 mt-1">Como será conhecido pelos clientes?</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-pistachio/60">Nome</Label>
              <Input
                placeholder="Ex: Assistente Virtual, Vendedor IA..."
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="bg-[#021f1b]/60 border-forest/30 text-white h-12 text-lg font-bold focus:border-[#45fd94]"
              />
            </div>
          </div>
        );

      case 5: {
        const ToggleBtn = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
          <button onClick={onToggle} className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
            enabled ? "bg-[#45fd94]/20 border-[#45fd94]/40 text-[#45fd94]" : "bg-forest/10 border-forest/30 text-pistachio/50 hover:border-forest/50"
          )}>
            {enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {enabled ? "ATIVO" : "INATIVO"}
          </button>
        );
        return (
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Conexões Avançadas</h3>
                <p className="text-sm text-pistachio/70 mt-1">Expanda os superpoderes do seu agente ligando-o a apps externas.</p>
              </div>

              {/* Google integrations */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Workspace Ecosystem</p>
                {[
                  { label: "Google Calendar", desc: "Marcar eventos e consultar disponibilidade", icon: <Calendar className="h-5 w-5 text-blue-400" />, enabled: enableGoogleCalendar, toggle: () => setEnableGoogleCalendar(p => !p) },
                  { label: "Google Sheets", desc: "Ler e escrever dados dinamicamente", icon: <FileText className="h-5 w-5 text-emerald-400" />, enabled: enableGoogleSheets, toggle: () => setEnableGoogleSheets(p => !p) },
                  { label: "Gmail", desc: "Aceder e enviar emails autonomamente", icon: <MessageSquare className="h-5 w-5 text-red-400" />, enabled: enableGmail, toggle: () => setEnableGmail(p => !p) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-[#021f1b]/60 border border-forest/20 hover:border-forest/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-black/20 rounded-lg">{item.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-xs text-pistachio/60">{item.desc}</p>
                      </div>
                    </div>
                    <ToggleBtn enabled={item.enabled} onToggle={item.toggle} />
                  </div>
                ))}
              </div>

              {/* Webhook */}
              <div className="space-y-3 pt-4 border-t border-forest/20">
                <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest">Webhooks (n8n, Make, Zapier)</p>
                <div className="p-4 rounded-xl bg-[#021f1b]/60 border border-forest/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Webhook className="h-4 w-4 text-amber-400" />
                    <Label className="text-xs font-bold text-white">URL do Webhook</Label>
                  </div>
                  <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." className="bg-black/30 border-forest/30 text-white text-xs h-10 font-mono" />
                </div>
              </div>
            </div>
          </ScrollArea>
        );
      }

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Canal de Comunicação</h3>
              <p className="text-sm text-pistachio/70 mt-1">Onde pretende que o agente responda aos clientes?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CHANNEL_OPTIONS.map(opt => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={opt.id}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden",
                    channel === opt.id ? "bg-[#45fd94]/10 border-[#45fd94]" : "bg-[#021f1b]/60 border-forest/30 hover:border-forest/50"
                  )}
                  onClick={() => { setChannel(opt.id); if (opt.id !== "whatsapp") setSelectedInstanceId(null); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-lg", channel === opt.id ? "bg-[#45fd94] text-[#011612]" : "bg-forest/20 text-pistachio")}>
                      {opt.icon}
                    </div>
                    <h4 className={cn("font-bold text-sm", channel === opt.id ? "text-white" : "text-pistachio")}>{opt.title}</h4>
                  </div>
                  <p className="text-xs text-pistachio/60">{opt.description}</p>
                </motion.div>
              ))}
            </div>
            {channel === "whatsapp" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 p-4 bg-forest/10 border border-forest/20 rounded-xl mt-4">
                <Label className="text-xs uppercase tracking-wider text-pistachio/60">Selecione a Instância WhatsApp</Label>
                {instances.length === 0 ? (
                  <p className="text-xs text-amber-400">Nenhuma instância disponível. Crie uma em Integrações.</p>
                ) : (
                  <Select value={selectedInstanceId || ""} onValueChange={setSelectedInstanceId}>
                    <SelectTrigger className="bg-[#021f1b]/60 border-forest/30 text-white h-10">
                      <SelectValue placeholder="Selecione uma instância..." />
                    </SelectTrigger>
                    <SelectContent>
                      {instances.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.instance_name} {inst.status === "connected" ? "✓" : "(desconectado)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </motion.div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", bounce: 0.5 }} className="h-20 w-20 rounded-full bg-[#45fd94]/20 flex items-center justify-center border-2 border-[#45fd94] shadow-[0_0_30px_rgba(69,253,148,0.3)]">
              <CheckCircle2 className="h-10 w-10 text-[#45fd94]" />
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Agente Criado!</h3>
              <p className="text-pistachio/70">O agente <span className="text-[#45fd94] font-bold">{agentName}</span> está configurado e pronto.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-[#011612]/95 backdrop-blur-2xl border border-forest/30 text-white shadow-[0_0_80px_rgba(69,253,148,0.15)] sm:rounded-2xl p-0">
        <div className="p-6 border-b border-forest/20 bg-gradient-to-r from-[#021f1b] to-[#011612]">
          <DialogTitle className="text-white font-display font-bold text-2xl flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[#45fd94]" /> Criação de Agente
          </DialogTitle>
          <DialogDescription className="text-pistachio/60 mt-1">
            Construa inteligência artificial avançada em poucos passos.
          </DialogDescription>
        </div>

        <div className="p-6 md:px-10">
          <AnimatedStepper />
          <div className="min-h-[350px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-forest/20 bg-[#021f1b]/50 backdrop-blur-sm">
          {currentStep < getFinalStepIndex() ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 0 || isAICreating}
                className="border-forest/40 text-pistachio hover:bg-forest/20 hover:text-white"
              >
                Voltar
              </Button>
              {currentStep === getCreateStepIndex() ? (
                <Button 
                  onClick={handleCreate} 
                  disabled={!canProceed()}
                  className="bg-[#45fd94] hover:bg-[#3ce585] text-[#011612] font-bold px-8 shadow-[0_0_20px_rgba(69,253,148,0.3)] hover:shadow-[0_0_30px_rgba(69,253,148,0.5)] transition-all"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Criar Agente Agora
                </Button>
              ) : currentStep === 2 && creationMethod === "ai" ? (
                <Button disabled className="bg-[#45fd94]/50 text-[#011612] font-bold px-8">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> A Processar
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed() || isAICreating}
                  className="bg-white hover:bg-gray-100 text-[#011612] font-bold px-8 shadow-lg"
                >
                  {creationMethod === "ai" && currentStep === 1 ? (
                    <><Wand2 className="h-4 w-4 mr-2" /> Gerar Inteligência</>
                  ) : "Avançar"}
                </Button>
              )}
            </>
          ) : (
            <>
              <div />
              <Button onClick={handleClose} className="bg-[#45fd94] hover:bg-[#3ce585] text-[#011612] font-bold px-8">
                Concluir e Ver Agente
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
