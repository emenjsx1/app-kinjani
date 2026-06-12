import { useState, useEffect } from "react";
import { Bot, MessageSquare, Users, Sparkles, Calendar, ArrowRight, CheckCircle2, FileText, Wand2, Coins, Loader2, Webhook, Link2, Server, ExternalLink, Globe, ToggleLeft, ToggleRight } from "lucide-react";
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
import { Stepper, CardSelect } from "@/components/ui/stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROMPT_TEMPLATES, getTemplatesForAgentType, PromptTemplate } from "@/lib/agent-templates";
import { useAgentAI } from "@/hooks/useAgentAI";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { toast } from "sonner";

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
  // Conversacionais
  {
    id: "atendimento-faq",
    title: "Atendimento / FAQ",
    description: "Responde dúvidas frequentes e atende clientes",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "conversational",
  },
  {
    id: "captura-leads",
    title: "Captura de Leads",
    description: "Captura contactos numa conversa natural",
    icon: <Users className="h-5 w-5" />,
    category: "conversational",
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    description: "Qualifica leads como Hot, Warm ou Cold via conversa",
    icon: <Sparkles className="h-5 w-5" />,
    category: "conversational",
  },
  {
    id: "follow-up",
    title: "Follow-up",
    description: "Mensagens de seguimento personalizadas",
    icon: <ArrowRight className="h-5 w-5" />,
    category: "conversational",
  },
  // Automação
  {
    id: "scrapper-leads",
    title: "Scrapper de Leads",
    description: "Pesquisa empresas e gera lista de contactos",
    icon: <Users className="h-5 w-5" />,
    category: "automation",
  },
  {
    id: "disparo-whatsapp",
    title: "Disparo WhatsApp",
    description: "Envia mensagens em massa com controlo de limites",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "automation",
  },
  {
    id: "disparo-email",
    title: "Disparo de Email",
    description: "Envia campanhas de email em massa",
    icon: <FileText className="h-5 w-5" />,
    category: "automation",
  },
  // Funcionais via prompt + agent-chat
  {
    id: "agendamento",
    title: "Agendamento",
    description: "Recolhe pedidos de marcação e regista agendamentos",
    icon: <Calendar className="h-5 w-5" />,
    category: "automation",
  },
  {
    id: "controlo-gastos",
    title: "Controlo de Gastos",
    description: "Regista despesas e devolve resumos do orçamento",
    icon: <Coins className="h-5 w-5" />,
    category: "automation",
  },
  // Em breve
  {
    id: "gmail-contacts",
    title: "Gmail → Contactos",
    description: "Extrai remetentes do Gmail para contactos (requer Google)",
    icon: <Users className="h-5 w-5" />,
    category: "automation",
    comingSoon: true,
  },
];

const CHANNEL_OPTIONS = [
  {
    id: "embed",
    title: "Website Embed",
    description: "Incorpora o widget de chat no seu site",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Liga a uma instância WhatsApp conectada",
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

const CREATION_METHODS = [
  {
    id: "manual",
    title: "Criar Manualmente",
    description: "Escolha tipo, template e personalize o prompt",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "ai",
    title: "Criar com IA",
    description: "Descreva o que quer e a IA cria o agente",
    icon: <Wand2 className="h-5 w-5" />,
    badge: "2 créditos",
  },
];

export function CreateAgentWizard({ open, onOpenChange, onAgentCreated }: CreateAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai" | null>("ai");
  const [agentType, setAgentType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [agentName, setAgentName] = useState("");
  const [channel, setChannel] = useState<string | null>("embed");
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

  // Templates disponíveis para o tipo selecionado
  const availableTemplates = agentType ? getTemplatesForAgentType(agentType) : [];

  const resetWizard = () => {
    setCurrentStep(1);
    setCreationMethod("ai");
    setAgentType(null);
    setSelectedTemplate(null);
    setPrompt("");
    setAgentName("");
    setChannel("embed");
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
      // Se selecionar template, preencher o prompt automaticamente
      if (creationMethod === "manual" && currentStep === 2 && selectedTemplate) {
        setPrompt(selectedTemplate.prompt);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Reset AI state if going back from AI path
      if (creationMethod === "ai" && currentStep === 3) {
        setGeneratedAgent(null);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setCurrentStep(3); // Ir direto para o prompt
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
    handleNext(); // Go to success step
  };

  const getSteps = () => {
    return creationMethod === "ai" ? AI_STEPS : STEPS;
  };

  const canProceed = () => {
    const steps = getSteps();
    
    if (creationMethod === "ai") {
      switch (currentStep) {
        case 0:
          return creationMethod !== null;
        case 1:
          return aiDescription.trim().length > 10 && businessName.trim().length > 2;
        case 2:
          return false; // Generating...
        case 3:
          return agentName.trim().length > 2;
        case 4:
          return channel !== null && (channel !== "whatsapp" || selectedInstanceId !== null);
        default:
          return true;
      }
    } else {
      switch (currentStep) {
        case 0:
          return creationMethod !== null;
        case 1:
          return agentType !== null;
        case 2:
          return true; // Template é opcional
        case 3:
          return prompt.trim().length > 10;
        case 4:
          return agentName.trim().length > 2;
        case 5:
          return true; // Connections are optional
        case 6:
          return channel !== null && (channel !== "whatsapp" || selectedInstanceId !== null);
        default:
          return true;
      }
    }
  };

  const getFinalStepIndex = () => {
    return creationMethod === "ai" ? 5 : 7;
  };

  const getCreateStepIndex = () => {
    return creationMethod === "ai" ? 4 : 6;
  };

  const renderStep = () => {
    // Step 0: Choose method
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Como quer criar o agente?</h3>
            <p className="text-sm text-muted-foreground">
              Escolha o método de criação do seu agente IA
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CREATION_METHODS.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                  creationMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => setCreationMethod(method.id as "manual" | "ai")}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{method.title}</h4>
                      {method.badge && (
                        <Badge variant="secondary" className="text-xs">
                          <Coins className="h-3 w-3 mr-1" />
                          {method.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                  {creationMethod === method.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Descreva o Seu Agente</h3>
                <p className="text-sm text-muted-foreground">
                  A IA vai criar um agente personalizado baseado na sua descrição
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                <Coins className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700 dark:text-amber-400">
                  Esta ação gasta 2 créditos
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Negócio</Label>
                    <Input
                      placeholder="Ex: Clínica São João"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nicho</Label>
                    <Input
                      placeholder="Ex: Saúde, Advocacia, Imobiliária"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição do Agente</Label>
                  <Textarea
                    placeholder="Descreva o que o seu agente deve fazer. Ex: Quero um agente que responda perguntas sobre os nossos serviços médicos, marque consultas e capte leads de potenciais pacientes..."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quanto mais detalhes der, melhor será o agente gerado.
                  </p>
                </div>
              </div>
            </div>
          );

        case 2:
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">A criar o seu agente...</h3>
                <p className="text-sm text-muted-foreground">
                  A IA está a gerar o prompt perfeito para o seu negócio.
                </p>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Agente Gerado!</h3>
                <p className="text-sm text-muted-foreground">
                  Reveja e ajuste o nome do seu agente
                </p>
              </div>

              {generatedAgent && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      Agente criado com sucesso
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {generatedAgent.description}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Nome do Agente</Label>
                <Input
                  placeholder="Nome do agente"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-muted-foreground">Prompt Gerado (pode editar)</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] font-mono text-xs"
                />
              </div>
            </div>
          );

        case 4:
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Selecionar Canal</h3>
                <p className="text-sm text-muted-foreground">
                  Onde o seu agente estará disponível?
                </p>
              </div>
              <CardSelect
                options={CHANNEL_OPTIONS}
                value={channel}
                onChange={(val) => {
                  setChannel(val);
                  if (val !== "whatsapp") {
                    setSelectedInstanceId(null);
                  }
                }}
                className="grid-cols-2"
              />
              
              {channel === "whatsapp" && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <Label>Instância WhatsApp</Label>
                  {instances.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma instância disponível. Crie uma em Integrações.
                    </p>
                  ) : (
                    <Select value={selectedInstanceId || ""} onValueChange={setSelectedInstanceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instância" />
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
                </div>
              )}
            </div>
          );

        case 5:
          return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Agente Criado!</h3>
                <p className="text-muted-foreground">
                  O seu agente <span className="font-medium text-foreground">{agentName}</span> está pronto a usar.
                </p>
                <Badge variant="secondary">
                  <Wand2 className="h-3 w-3 mr-1" />
                  Criado com IA
                </Badge>
              </div>
            </div>
          );
      }
    }

    // Manual Creation Path
    switch (currentStep) {
      case 1: {
        const conversational = AGENT_TYPES.filter((t) => t.category === "conversational");
        const automation = AGENT_TYPES.filter((t) => t.category === "automation");

        const renderCard = (type: AgentTypeDef) => {
          const disabled = !!type.comingSoon;
          const selected = agentType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setAgentType(type.id)}
              className={`text-left p-4 border rounded-lg transition-all ${
                disabled
                  ? "opacity-50 cursor-not-allowed border-border bg-muted/30"
                  : selected
                  ? "border-primary bg-primary/5 cursor-pointer"
                  : "border-border hover:border-primary/50 cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-primary/10 shrink-0">{type.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{type.title}</h4>
                    {disabled && (
                      <Badge variant="outline" className="text-xs">Em breve</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
                {selected && !disabled && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </button>
          );
        };

        return (
          <ScrollArea className="max-h-[460px] pr-3">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Selecionar Tipo de Agente</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha como o agente deve operar
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Conversacionais</h4>
                  <span className="text-xs text-muted-foreground">— respondem por chat / WhatsApp</span>
                </div>
                <div className="grid grid-cols-2 gap-3">{conversational.map(renderCard)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Automação</h4>
                  <span className="text-xs text-muted-foreground">— executam tarefas em massa</span>
                </div>
                <div className="grid grid-cols-2 gap-3">{automation.map(renderCard)}</div>
              </div>
            </div>
          </ScrollArea>
        );
      }

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Escolher Template (Opcional)</h3>
              <p className="text-sm text-muted-foreground">
                Use um template profissional ou crie o seu próprio prompt
              </p>
            </div>
            
            {availableTemplates.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {template.nicheLabel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum template disponível para este tipo.</p>
                <p className="text-sm">Você pode criar o seu próprio prompt.</p>
              </div>
            )}

            <Button variant="ghost" onClick={handleSkipTemplate} className="w-full">
              Criar prompt do zero →
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Definir Comportamento do Agente</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate
                  ? "Personalize o template ou use como está"
                  : "Escreva um prompt que descreva como o seu agente deve comportar-se"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt do Agente</Label>
              <Textarea
                id="prompt"
                placeholder="Você é um assistente de apoio ao cliente da [Nome da Empresa]. Ajuda os utilizadores com..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres. Seja específico sobre a personalidade e conhecimento do agente.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome do Agente</h3>
              <p className="text-sm text-muted-foreground">
                Dê um nome memorável ao seu agente
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente</Label>
              <Input
                id="name"
                placeholder="ex: Assistente de Vendas, Bot FAQ, Agente de Suporte"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>
          </div>
        );

      case 5: {
        // Connections step for manual path
        const ToggleBtn = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
          <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            enabled
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-forest/10 border-forest/30 text-pistachio/60 hover:border-forest/50"
          }`}>
            {enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {enabled ? "ATIVO" : "INATIVO"}
          </button>
        );
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Conexões do Agente</h3>
              <p className="text-sm text-pistachio/70">
                Ative integrações externas para expandir as capacidades deste agente
              </p>
            </div>

            {/* Google integrations */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest">Google Workspace</p>
              {[
                { label: "Google Calendar", desc: "Marcar e consultar eventos via chat", icon: <Calendar className="h-4 w-4 text-blue-400" />, enabled: enableGoogleCalendar, toggle: () => setEnableGoogleCalendar(p => !p), soon: false },
                { label: "Google Sheets", desc: "Ler/escrever dados em spreadsheets", icon: <Globe className="h-4 w-4 text-emerald-400" />, enabled: enableGoogleSheets, toggle: () => setEnableGoogleSheets(p => !p), soon: false },
                { label: "Gmail", desc: "Enviar emails e ler inbox via agente", icon: <MessageSquare className="h-4 w-4 text-red-400" />, enabled: enableGmail, toggle: () => setEnableGmail(p => !p), soon: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-forest/10 border border-forest/20">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-pistachio/60">{item.desc}</p>
                    </div>
                  </div>
                  <ToggleBtn enabled={item.enabled} onToggle={item.toggle} />
                </div>
              ))}
            </div>

            {/* Webhook */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest">Webhook de Saída</p>
              <div className="space-y-2 p-3 rounded-lg bg-forest/10 border border-forest/20">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-secondary" />
                  <Label className="text-sm text-white">URL do Webhook (opcional)</Label>
                </div>
                <Input
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://n8n.empresa.com/webhook/..."
                  className="bg-background/40 border-forest/30 text-white text-xs focus:border-primary/50"
                />
                <p className="text-[10px] text-pistachio/50">O agente enviará eventos POST para este endpoint</p>
              </div>
            </div>

            {/* MCP */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest">MCP Server (Model Context Protocol)</p>
              <div className="space-y-2 p-3 rounded-lg bg-forest/10 border border-forest/20">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-violet-400" />
                  <Label className="text-sm text-white">URL do Servidor MCP (opcional)</Label>
                </div>
                <Input
                  value={mcpServerUrl}
                  onChange={e => setMcpServerUrl(e.target.value)}
                  placeholder="http://localhost:3000/mcp"
                  className="bg-background/40 border-forest/30 text-white text-xs focus:border-primary/50"
                />
                <p className="text-[10px] text-pistachio/50">Permite ao agente usar ferramentas externas via protocolo MCP</p>
              </div>
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Selecionar Canal</h3>
              <p className="text-sm text-muted-foreground">
                Onde o seu agente estará disponível?
              </p>
            </div>
            <CardSelect
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={(val) => {
                setChannel(val);
                if (val !== "whatsapp") {
                  setSelectedInstanceId(null);
                }
              }}
              className="grid-cols-2"
            />
            
            {channel === "whatsapp" && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <Label>Instância WhatsApp</Label>
                {instances.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma instância disponível. Crie uma em Integrações.
                  </p>
                ) : (
                  <Select value={selectedInstanceId || ""} onValueChange={setSelectedInstanceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma instância" />
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
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">Agente Criado!</h3>
              <p className="text-pistachio/70">
                O seu agente <span className="font-medium text-white">{agentName}</span> está pronto a usar.
              </p>
              <p className="text-sm text-pistachio/60">
                Teste o agente com IA real na aba "Testar Agente".
              </p>
            </div>
            {(enableGoogleCalendar || enableGoogleSheets || enableGmail || webhookUrl || mcpServerUrl) && (
              <div className="w-full p-3 rounded-lg bg-forest/10 border border-forest/20 space-y-1.5">
                <p className="text-[10px] font-bold text-pistachio/50 uppercase tracking-widest mb-2">Conexões Ativas</p>
                {enableGoogleCalendar && <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" />Google Calendar</p>}
                {enableGoogleSheets && <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" />Google Sheets</p>}
                {enableGmail && <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" />Gmail</p>}
                {webhookUrl && <p className="text-xs text-secondary flex items-center gap-2"><Webhook className="h-3.5 w-3.5" />Webhook: {webhookUrl.substring(0, 40)}...</p>}
                {mcpServerUrl && <p className="text-xs text-violet-400 flex items-center gap-2"><Server className="h-3.5 w-3.5" />MCP: {mcpServerUrl.substring(0, 40)}...</p>}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white shadow-[0_0_50px_rgba(69,253,148,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white font-display font-bold text-xl">Criar Novo Agente</DialogTitle>
          <DialogDescription className="text-pistachio/70">
            Configure o seu agente IA em apenas alguns passos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Stepper steps={getSteps()} currentStep={currentStep} className="mb-8 text-primary" />
          <div className="text-white">
            {renderStep()}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-forest/20">
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
                  className="bg-primary hover:bg-primary/95 text-background font-bold"
                >
                  Criar Agente
                </Button>
              ) : currentStep === 2 && creationMethod === "ai" ? (
                <Button disabled className="bg-primary/50 text-background font-bold">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A gerar...
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed() || isAICreating}
                  className="bg-primary hover:bg-primary/95 text-background font-bold"
                >
                  {creationMethod === "ai" && currentStep === 1 ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar com IA
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              )}
            </>
          ) : (
            <>
              <div />
              <Button onClick={handleClose} className="bg-primary hover:bg-primary/95 text-background font-bold">
                Ver Agente
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
