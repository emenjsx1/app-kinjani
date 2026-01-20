import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, Bot, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ChatContainer } from "@/components/chat";
import { AgentFlowVisual } from "@/components/agents/AgentFlowVisual";
import { useAgentChat } from "@/hooks/useAgentChat";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  typeId?: string;
  prompt: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
}

export default function AgentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hook de chat com IA real
  const { messages, isLoading, sendMessage, clearMessages } = useAgentChat({
    agentType: agent?.typeId || "atendimento-faq",
    agentPrompt: prompt,
  });

  // Determinar tab inicial baseado na URL
  const defaultTab = searchParams.get("tab") || "settings";

  useEffect(() => {
    // Carregar agente do localStorage
    const storedAgents = localStorage.getItem("kinja-agents");
    if (storedAgents) {
      const agents: Agent[] = JSON.parse(storedAgents);
      const foundAgent = agents.find((a) => a.id === id);
      if (foundAgent) {
        setAgent(foundAgent);
        setIsActive(foundAgent.status === "active");
        setPrompt(foundAgent.prompt || "");
      }
    }
  }, [id]);

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    if (agent) {
      const newStatus = checked ? "active" : "inactive";
      updateAgent({ ...agent, status: newStatus });
      toast.success(`Agente ${checked ? "ativado" : "desativado"}`);
    }
  };

  const handleSavePrompt = () => {
    if (agent) {
      setIsSaving(true);
      setTimeout(() => {
        updateAgent({ ...agent, prompt });
        setIsSaving(false);
        toast.success("Prompt guardado com sucesso");
      }, 500);
    }
  };

  const updateAgent = (updatedAgent: Agent) => {
    const storedAgents = localStorage.getItem("kinja-agents");
    if (storedAgents) {
      const agents: Agent[] = JSON.parse(storedAgents);
      const updatedAgents = agents.map((a) => (a.id === updatedAgent.id ? updatedAgent : a));
      localStorage.setItem("kinja-agents", JSON.stringify(updatedAgents));
      setAgent(updatedAgent);
    }
  };

  const embedCode = `<!-- KINJA AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://widget.kinja.ai/chat.js';
    script.async = true;
    script.dataset.agentId = '${id}';
    document.head.appendChild(script);
  })();
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Código embed copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleClearChat = () => {
    clearMessages();
    toast.success("Conversa reiniciada");
  };

  if (!agent) {
    return (
      <AppLayout pageTitle="Agente Não Encontrado" credits={1250}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Agente não encontrado</p>
          <Button onClick={() => navigate("/agents")}>Voltar aos Agentes</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={agent.name} credits={1250}>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">{agent.type}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <StatusBadge status={isActive ? "active" : "inactive"} />
            <div className="flex items-center gap-2">
              <Label htmlFor="status" className="text-sm">Ativo</Label>
              <Switch
                id="status"
                checked={isActive}
                onCheckedChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Definições</TabsTrigger>
            <TabsTrigger value="flow">Fluxo</TabsTrigger>
            <TabsTrigger value="embed">Código Embed</TabsTrigger>
            <TabsTrigger value="test">Testar Agente</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prompt do Agente</CardTitle>
                <CardDescription>
                  Defina como o seu agente deve comportar-se e responder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Você é um assistente útil..."
                  className="min-h-[200px]"
                />
                <Button onClick={handleSavePrompt} disabled={isSaving}>
                  {isSaving ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo do Agente</CardTitle>
                <CardDescription>
                  Visualização do fluxo de processamento do agente ({agent.type})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentFlowVisual className="py-4" agentType={agent.typeId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Código Embed</CardTitle>
                <CardDescription>
                  Adicione este código ao seu site para ativar o widget de chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock code={embedCode} language="html" />
                <Button onClick={handleCopyCode} variant="outline">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Código
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Testar o Seu Agente</CardTitle>
                    <CardDescription>
                      Envie mensagens de teste para ver como o seu agente responde com IA real
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearChat}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg h-[400px]">
                  <ChatContainer
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Escreva uma mensagem de teste..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
