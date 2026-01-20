import { useState } from "react";
import { Bot, MessageSquare, Users, Sparkles, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
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

const STEPS = ["Tipo", "Prompt", "Nome", "Canal", "Concluído"];

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

export function CreateAgentWizard({ open, onOpenChange, onAgentCreated }: CreateAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [agentName, setAgentName] = useState("");
  const [channel, setChannel] = useState<string | null>("embed");

  const resetWizard = () => {
    setCurrentStep(0);
    setAgentType(null);
    setPrompt("");
    setAgentName("");
    setChannel("embed");
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    const selectedType = AGENT_TYPES.find((t) => t.id === agentType);
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentName,
      type: selectedType?.title || "Personalizado",
      typeId: agentType || "custom",
      prompt: prompt,
      status: "active",
      channel: channel as "embed" | "whatsapp" | "both",
      messagesHandled: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    onAgentCreated(newAgent);
    handleNext(); // Go to success step
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return agentType !== null;
      case 1:
        return prompt.trim().length > 10;
      case 2:
        return agentName.trim().length > 2;
      case 3:
        return channel !== null;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
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

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Definir Comportamento do Agente</h3>
              <p className="text-sm text-muted-foreground">
                Escreva um prompt que descreva como o seu agente deve comportar-se
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt do Agente</Label>
              <Textarea
                id="prompt"
                placeholder="Você é um assistente de apoio ao cliente da [Nome da Empresa]. Ajuda os utilizadores com..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres. Seja específico sobre a personalidade e conhecimento do agente.
              </p>
            </div>
          </div>
        );

      case 2:
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

      case 3:
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

      case 4:
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
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Configure o seu agente IA em apenas alguns passos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {currentStep < 4 ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                Voltar
              </Button>
              {currentStep === 3 ? (
                <Button onClick={handleCreate} disabled={!canProceed()}>
                  Criar Agente
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continuar
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
