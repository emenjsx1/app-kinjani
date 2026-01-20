import { useState } from "react";
import { Bot, MessageSquare, Users, Sparkles, Globe, CheckCircle2 } from "lucide-react";
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

const STEPS = ["Type", "Prompt", "Name", "Channel", "Complete"];

const AGENT_TYPES = [
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Answer customer questions and resolve issues",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: "lead-generation",
    title: "Lead Generation",
    description: "Qualify leads and capture contact information",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    description: "Provide information from your documentation",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    id: "sales-assistant",
    title: "Sales Assistant",
    description: "Help customers with product recommendations",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const CHANNEL_OPTIONS = [
  {
    id: "embed",
    title: "Website Embed",
    description: "Embed the chat widget on your website",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Connect to WhatsApp Business (Coming Soon)",
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
      type: selectedType?.title || "Custom",
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
              <h3 className="text-lg font-semibold">Select Agent Type</h3>
              <p className="text-sm text-muted-foreground">
                Choose the type of AI agent you want to create
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
              <h3 className="text-lg font-semibold">Define Agent Behavior</h3>
              <p className="text-sm text-muted-foreground">
                Write a prompt that describes how your agent should behave
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Agent Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="You are a helpful customer support agent for [Company Name]. You help users with..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. Be specific about your agent's personality and knowledge.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Name Your Agent</h3>
              <p className="text-sm text-muted-foreground">
                Give your agent a memorable name
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Assistant, FAQ Bot, Support Agent"
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
              <h3 className="text-lg font-semibold">Select Channel</h3>
              <p className="text-sm text-muted-foreground">
                Where will your agent be available?
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
              <h3 className="text-xl font-semibold">Agent Created!</h3>
              <p className="text-muted-foreground">
                Your agent <span className="font-medium text-foreground">{agentName}</span> is ready to use.
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
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Set up your AI agent in just a few steps
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
                Back
              </Button>
              {currentStep === 3 ? (
                <Button onClick={handleCreate} disabled={!canProceed()}>
                  Create Agent
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continue
                </Button>
              )}
            </>
          ) : (
            <>
              <div />
              <Button onClick={handleClose}>
                View Agent
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
