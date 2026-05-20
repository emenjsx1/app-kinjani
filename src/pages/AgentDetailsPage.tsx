import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, Bot, RotateCcw, MessageSquare, AlertCircle } from "lucide-react";
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
import { AutomationPanel } from "@/components/agents/AutomationPanel";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useAgents, Agent } from "@/hooks/useAgents";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

export default function AgentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAgent, updateAgent } = useAgents();
  const { instances, isLoading: isLoadingInstances, refetch: fetchInstances } = useWhatsAppInstances();
  const { profile } = useProfile();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingInstance, setIsSavingInstance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Hook de chat com IA real
  const { messages, isLoading: isChatLoading, sendMessage, clearMessages } = useAgentChat({
    agentType: agent?.type_id || "atendimento-faq",
    agentPrompt: prompt,
  });

  // Determinar tab inicial baseado na URL
  const defaultTab = searchParams.get("tab") || "settings";

  useEffect(() => {
    let isMounted = true;
    
    const loadAgent = async () => {
      if (!id) {
        navigate("/agents");
        return;
      }

      setIsLoading(true);
      try {
        const foundAgent = await getAgent(id);
        
        if (isMounted && foundAgent) {
          setAgent(foundAgent);
          setIsActive(foundAgent.status === "active");
          setPrompt(foundAgent.prompt || "");
          setSelectedInstanceId(foundAgent.instance_id || null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAgent();
    fetchInstances();
    
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleStatusChange = async (checked: boolean) => {
    if (!agent) return;
    
    setIsActive(checked);
    const newStatus = checked ? "active" : "inactive";
    
    const result = await updateAgent(agent.id, { status: newStatus });
    if (result) {
      setAgent(result);
      toast.success(`Agente ${checked ? "ativado" : "desativado"}`);
    } else {
      setIsActive(!checked); // Revert on error
      toast.error("Erro ao atualizar estado do agente");
    }
  };

  const handleSavePrompt = async () => {
    if (!agent) return;
    
    setIsSaving(true);
    const result = await updateAgent(agent.id, { prompt });
    
    if (result) {
      setAgent(result);
      toast.success("Prompt guardado com sucesso");
    } else {
      toast.error("Erro ao guardar prompt");
    }
    setIsSaving(false);
  };

  const handleSaveInstance = async () => {
    if (!agent) return;
    
    setIsSavingInstance(true);
    const result = await updateAgent(agent.id, { instance_id: selectedInstanceId });
    
    if (result) {
      setAgent(result);
      
      // Also reconfigure webhook on Evolution API
      if (selectedInstanceId) {
        const selectedInstance = instances.find(i => i.id === selectedInstanceId);
        if (selectedInstance?.instance_key) {
          try {
            const res = await fetch(
              `https://mpxsivfiltwvnvqtixuo.supabase.co/functions/v1/whatsapp-agent?action=setup-webhook&instance=${selectedInstance.instance_key}`
            );
            const webhookResult = await res.json();
            console.log('Webhook reconfigured:', webhookResult);
            if (webhookResult.success) {
              toast.success("Instância WhatsApp e webhook configurados com sucesso");
            } else {
              toast.warning("Instância salva, mas houve um problema ao configurar o webhook");
            }
          } catch (e) {
            console.error('Error setting up webhook:', e);
            toast.warning("Instância salva, mas não foi possível configurar o webhook");
          }
        }
      } else {
        toast.success("Instância WhatsApp atualizada com sucesso");
      }
    } else {
      toast.error("Erro ao atualizar instância");
    }
    setIsSavingInstance(false);
  };

  const connectedInstances = instances.filter(i => i.status === "connected");

  const widgetOrigin = typeof window !== "undefined" ? window.location.origin : "https://bloom-design-foundry.lovable.app";
  const embedCode = `<!-- Kinjani AI Chat Widget -->
<script src="${widgetOrigin}/widget.js" async data-agent-id="${id}" data-position="bottom-right" data-primary-color="#00DF81"></script>`;

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

  if (isLoading) {
    return (
      <AppLayout pageTitle="Carregando..." credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!agent) {
    return (
      <AppLayout pageTitle="Agente Não Encontrado" credits={profile?.credits_balance ?? 0}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Agente não encontrado</p>
          <Button onClick={() => navigate("/agents")}>Voltar aos Agentes</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={agent.name} credits={profile?.credits_balance ?? 0}>
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
            {["disparo-email", "disparo-whatsapp", "scrapper-leads"].includes(agent.type_id || "") && (
              <TabsTrigger value="automation">Executar</TabsTrigger>
            )}
            <TabsTrigger value="flow">Fluxo</TabsTrigger>
            <TabsTrigger value="embed">Código Embed</TabsTrigger>
            <TabsTrigger value="test">Testar Agente</TabsTrigger>
          </TabsList>

          <TabsContent value="automation" className="space-y-4">
            <AutomationPanel agentTypeId={agent.type_id || ""} agentName={agent.name} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Instância WhatsApp */}
            {agent.channel === "whatsapp" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Instância WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Selecione qual instância WhatsApp este agente deve usar para responder mensagens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectedInstances.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-dashed">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nenhuma instância conectada</p>
                        <p className="text-xs text-muted-foreground">
                          Primeiro crie e conecte uma instância WhatsApp em Integrações
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/integrations")}>
                        Ir para Integrações
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Instância WhatsApp</Label>
                        <Select
                          value={selectedInstanceId || "none"}
                          onValueChange={(value) => setSelectedInstanceId(value === "none" ? null : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma instância" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma instância</SelectItem>
                            {connectedInstances.map((instance) => (
                              <SelectItem key={instance.id} value={instance.id}>
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  {instance.instance_name}
                                  {instance.phone_number && (
                                    <span className="text-muted-foreground">
                                      ({instance.phone_number})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleSaveInstance} 
                        disabled={isSavingInstance || selectedInstanceId === agent.instance_id}
                      >
                        {isSavingInstance ? "A guardar..." : "Guardar Instância"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Prompt do Agente */}
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
                <AgentFlowVisual className="py-4" agentType={agent.type_id || undefined} />
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
                    isLoading={isChatLoading}
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
