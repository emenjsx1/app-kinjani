import { useState } from "react";
import { Bot, MessageSquare, Users, Sparkles, Calendar, ArrowRight, CheckCircle2, FileText, Wand2, Coins, Loader2 } from "lucide-react";
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
import { PROMPT_TEMPLATES, getTemplatesForAgentType, PromptTemplate } from "@/lib/agent-templates";
import { useAgentAI } from "@/hooks/useAgentAI";
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
}

interface CreateAgentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: (agent: Agent) => void;
}

const STEPS = ["Método", "Tipo", "Template", "Prompt", "Nome", "Canal", "Concluído"];
const AI_STEPS = ["Método", "IA", "A Gerar...", "Nome", "Canal", "Concluído"];

const AGENT_TYPES = [
  {
    id: "atendimento-faq",
    title: "Atendimento / FAQ",
    description: "Responde dúvidas frequentes e atende clientes",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: "captura-leads",
    title: "Captura de Leads",
    description: "Captura informações de contacto e qualifica leads",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    description: "Qualifica leads como Hot, Warm ou Cold",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "follow-up",
    title: "Follow-up",
    description: "Acompanha e faz seguimento de contactos",
    icon: <ArrowRight className="h-5 w-5" />,
  },
  {
    id: "agendamento",
    title: "Agendamento Simples",
    description: "Agenda reuniões e compromissos",
    icon: <Calendar className="h-5 w-5" />,
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
    description: "Ligar ao WhatsApp Business (Em breve)",
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
  const [currentStep, setCurrentStep] = useState(0);
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai" | null>(null);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [agentName, setAgentName] = useState("");
  const [channel, setChannel] = useState<string | null>("embed");
  
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

  // Templates disponíveis para o tipo selecionado
  const availableTemplates = agentType ? getTemplatesForAgentType(agentType) : [];

  const resetWizard = () => {
    setCurrentStep(0);
    setCreationMethod(null);
    setAgentType(null);
    setSelectedTemplate(null);
    setPrompt("");
    setAgentName("");
    setChannel("embed");
    setAiDescription("");
    setBusinessName("");
    setNiche("");
    setGeneratedAgent(null);
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
          return channel !== null;
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
          return channel !== null;
        default:
          return true;
      }
    }
  };

  const getFinalStepIndex = () => {
    return creationMethod === "ai" ? 5 : 6;
  };

  const getCreateStepIndex = () => {
    return creationMethod === "ai" ? 4 : 5;
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
                onChange={setChannel}
                className="grid-cols-2"
              />
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
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Selecionar Tipo de Agente</h3>
              <p className="text-sm text-muted-foreground">
                Escolha o tipo de agente IA que deseja criar
              </p>
            </div>
            <CardSelect
              options={AGENT_TYPES}
              value={agentType}
              onChange={setAgentType}
              className="grid-cols-2"
            />
          </div>
        );

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

      case 5:
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
              onChange={setChannel}
              className="grid-cols-2"
            />
          </div>
        );

      case 6:
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
              <p className="text-sm text-muted-foreground">
                Teste o agente com IA real na aba "Testar Agente".
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Configure o seu agente IA em apenas alguns passos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Stepper steps={getSteps()} currentStep={currentStep} className="mb-8" />
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {currentStep < getFinalStepIndex() ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isAICreating}>
                Voltar
              </Button>
              {currentStep === getCreateStepIndex() ? (
                <Button onClick={handleCreate} disabled={!canProceed()}>
                  Criar Agente
                </Button>
              ) : currentStep === 2 && creationMethod === "ai" ? (
                <Button disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A gerar...
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed() || isAICreating}>
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
              <Button onClick={handleClose}>
                Ver Agente
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
