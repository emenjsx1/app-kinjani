import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Copy, Check, Bot, RotateCcw, MessageSquare, AlertCircle, 
  Settings, Key, History, Zap, Shield, HelpCircle, Activity, Play, Send, Mic, Paperclip
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useAgents, Agent } from "@/hooks/useAgents";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [toneProfile, setToneProfile] = useState("Architectural / Precise");
  const [creativityLevel, setCreativityLevel] = useState(70);
  const [chatInput, setChatInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Hook de chat com IA real
  const { messages, isLoading: isChatLoading, sendMessage, clearMessages } = useAgentChat({
    agentType: agent?.type_id || "atendimento-faq",
    agentPrompt: prompt,
    agentId: id,
  });

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

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleDeployChanges = async () => {
    if (!agent) return;
    
    setIsSaving(true);
    try {
      // 1. Save prompt
      const promptResult = await updateAgent(agent.id, { prompt });
      if (!promptResult) throw new Error("Erro ao guardar prompt");

      // 2. Save instance configuration if whatsapp
      const instanceResult = await updateAgent(agent.id, { instance_id: selectedInstanceId });
      if (!instanceResult) throw new Error("Erro ao atualizar instância");

      // Reconfigure webhook on Evolution API if instance was saved
      if (selectedInstanceId) {
        const selectedInstance = instances.find(i => i.id === selectedInstanceId);
        if (selectedInstance?.instance_key) {
          try {
            const { data: webhookResult, error: webhookError } = await supabase.functions.invoke(
              "whatsapp-agent?action=setup-webhook&instance=" + selectedInstance.instance_key, 
              { method: "GET" }
            );
            if (webhookError) throw webhookError;
            console.log('Webhook reconfigured:', webhookResult);
            if (webhookResult.success) {
              toast.success("Prompt e webhook configurados com sucesso");
            } else {
              toast.warning("Alterações salvas, mas houve um problema ao configurar o webhook");
            }
          } catch (e) {
            console.error('Error setting up webhook:', e);
            toast.warning("Alterações salvas, mas não foi possível configurar o webhook");
          }
        }
      } else {
        toast.success("Alterações publicadas com sucesso");
      }

      const updatedAgent = await getAgent(agent.id);
      if (updatedAgent) setAgent(updatedAgent);
    } catch (err: any) {
      toast.error(err.message || "Erro ao publicar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  const handleClearChat = () => {
    clearMessages();
    toast.success("Conversa reiniciada");
  };

  const handleCopyText = (text: string, type: 'key' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
    toast.success("Copiado com sucesso!");
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Carregando..." credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!agent) {
    return (
      <AppLayout pageTitle="Agente Não Encontrado" credits={profile?.credits_balance ?? 0}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-pistachio mb-4">Agente não encontrado</p>
          <Button onClick={() => navigate("/agents")}>Voltar aos Agentes</Button>
        </div>
      </AppLayout>
    );
  }

  const connectedInstances = instances.filter(i => i.status === "connected");
  const widgetOrigin = typeof window !== "undefined" ? window.location.origin : "https://bloom-design-foundry.lovable.app";
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-agent?agent_id=${id}`;

  return (
    <AppLayout pageTitle={agent.name} credits={profile?.credits_balance ?? 0}>
      <div className="space-y-8 pb-12">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agents")} className="text-pistachio hover:text-white hover:bg-forest/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-white font-display">
                    {agent.name}
                  </h1>
                  <div className="flex items-center gap-2 bg-card/50 px-3 py-1 rounded-full border border-forest/30">
                    <span className="relative flex h-2 w-2">
                      {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-primary' : 'bg-pistachio/30'}`}></span>
                    </span>
                    <span className="text-[10px] font-bold text-pistachio tracking-widest uppercase">
                      {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-pistachio">{agent.type}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2 bg-card/30 border border-forest/35 px-3 py-1.5 rounded-lg">
              <Label htmlFor="status" className="text-xs text-pistachio cursor-pointer">Estado Ativo</Label>
              <Switch id="status" checked={isActive} onCheckedChange={handleStatusChange} />
            </div>
            <Button
              onClick={handleDeployChanges}
              disabled={isSaving}
              className="bg-primary hover:bg-primary-container text-background font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_-2px_rgba(69,253,148,0.3)] hover:shadow-[0_0_20px_0px_rgba(69,253,148,0.5)] border border-primary/20"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : <Play className="h-4 w-4 fill-current" />}
              <span>Publicar Alterações</span>
            </Button>
          </div>
        </header>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Personality & Prompt */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Personality Settings */}
            <div className="bg-card/40 backdrop-blur-md border border-forest/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Personalidade</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider text-pistachio/70 uppercase">Perfil de Tom</label>
                  <Select value={toneProfile} onValueChange={setToneProfile}>
                    <SelectTrigger className="w-full bg-background/40 border-forest/30 text-white text-xs">
                      <SelectValue placeholder="Selecione um tom" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-forest/30 text-white">
                      <SelectItem value="Architectural / Precise">Arquitetônico / Preciso</SelectItem>
                      <SelectItem value="Casual / Collaborative">Casual / Colaborativo</SelectItem>
                      <SelectItem value="Formal / Corporate">Formal / Corporativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider text-pistachio/70 uppercase">Nível de Criatividade</label>
                  <input 
                    type="range" 
                    value={creativityLevel}
                    onChange={(e) => setCreativityLevel(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-forest/30 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-pistachio/50">
                    <span>DETERMINÍSTICO</span>
                    <span>FLUIDO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Config */}
            <div className="bg-card/40 backdrop-blur-md border border-forest/20 rounded-2xl p-5 space-y-4 flex-1">
              <div className="flex items-center justify-between text-primary">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <h3 className="font-bold text-sm text-white">System Prompt</h3>
                </div>
              </div>
              <div className="relative group">
                <Textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-80 bg-background/50 border border-forest/20 rounded-xl p-4 font-mono text-xs text-primary/80 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none custom-scrollbar" 
                  placeholder="Defina o prompt do agente..."
                  spellCheck="false"
                />
              </div>
              <p className="text-xs text-pistachio/50 italic leading-snug">
                Influencia diretamente a lógica de tomada de decisão do agente e nuances de linguagem.
              </p>
            </div>
          </section>

          {/* Center Column: Sandbox Chat Interface */}
          <section className="lg:col-span-6 bg-card/30 backdrop-blur-md border border-forest/20 rounded-2xl flex flex-col h-[700px] relative overflow-hidden">
            {/* Sandbox Header */}
            <div className="px-6 py-4 border-b border-forest/20 flex items-center justify-between bg-surface-container-high/40 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-bold tracking-widest text-white uppercase">Sandbox em Tempo Real</h3>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1 text-pistachio/60 text-xs">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">Modelo Ativo</span>
                </div>
                <button onClick={handleClearChat} className="text-pistachio hover:text-red-400 transition-colors" title="Limpar conversa">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sandbox Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-pistachio/40 space-y-2">
                  <Bot className="h-12 w-12 opacity-30" />
                  <p className="text-sm">Envie uma mensagem no chat para testar a resposta do seu agente com IA real.</p>
                </div>
              ) : (
                messages.map((m, index) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={index} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} gap-1`}>
                      <div className={`p-4 rounded-xl text-xs max-w-[85%] border leading-relaxed ${
                        isUser 
                          ? 'bg-forest/20 border-forest/30 text-white rounded-tr-2xl rounded-br-2xl rounded-bl-sm' 
                          : 'bg-card/70 border-primary/20 text-[#cfe8e1] rounded-tl-2xl rounded-bl-2xl rounded-br-sm text-right'
                      }`}>
                        <p>{m.content}</p>
                      </div>
                      <span className="text-[9px] font-bold text-pistachio/40 uppercase px-1">
                        {isUser ? 'UTILIZADOR' : agent.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Sandbox Area */}
            <div className="p-6 pt-2 border-t border-forest/10">
              <div className="relative bg-background/50 border border-forest/20 focus-within:border-primary/50 transition-all rounded-xl p-1.5 flex flex-col">
                <Textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  className="w-full bg-transparent border-none text-white text-xs placeholder:text-pistachio/30 focus:ring-0 resize-none p-3 h-16" 
                  placeholder="Escreva algo para o agente..." 
                />
                <div className="flex items-center justify-between px-3 pb-2">
                  <div className="flex gap-2">
                    <button className="text-pistachio hover:text-primary transition-colors"><Paperclip className="h-4 w-4" /></button>
                    <button className="text-pistachio hover:text-primary transition-colors"><Mic className="h-4 w-4" /></button>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90 text-background w-8 h-8 rounded-lg flex items-center justify-center p-0 transition-transform active:scale-95 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Integrations, Logs & Usage */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Endpoints & Keys */}
            <div className="bg-card/40 backdrop-blur-md border border-forest/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Key className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Integração</h3>
              </div>
              
              <div className="space-y-4">
                {agent.channel === 'whatsapp' ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold tracking-wider text-pistachio/70 uppercase">Instância WhatsApp</Label>
                    {connectedInstances.length === 0 ? (
                      <div className="text-xs text-pistachio/50 p-3 bg-forest/5 border border-dashed border-forest/35 rounded-lg flex flex-col gap-2">
                        <span>Nenhuma instância WhatsApp conectada.</span>
                        <Button size="sm" variant="outline" className="text-[10px] h-7 border-forest/30" onClick={() => navigate("/integrations")}>
                          Configurar Integração
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Select 
                          value={selectedInstanceId || "none"} 
                          onValueChange={(val) => setSelectedInstanceId(val === 'none' ? null : val)}
                        >
                          <SelectTrigger className="w-full bg-background/40 border-forest/30 text-white text-xs">
                            <SelectValue placeholder="Escolha uma instância" />
                          </SelectTrigger>
                          <SelectContent className="bg-surface border-forest/30 text-white">
                            <SelectItem value="none">Nenhuma instância</SelectItem>
                            {connectedInstances.map((inst) => (
                              <SelectItem key={inst.id} value={inst.id}>
                                {inst.instance_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold tracking-wider text-pistachio/70 uppercase">Código Embed</Label>
                    <div className="flex items-center gap-2 bg-background/50 border border-forest/30 rounded-lg px-3 py-2">
                      <code className="text-xs text-primary/70 flex-1 truncate">data-agent-id="{id}"</code>
                      <button 
                        onClick={() => handleCopyText(embedCode, 'key')} 
                        className="text-pistachio hover:text-primary transition-colors"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-wider text-pistachio/70 uppercase">URL de Webhook</Label>
                  <div className="flex items-center gap-2 bg-background/50 border border-forest/30 rounded-lg px-3 py-2">
                    <code className="text-xs text-primary/70 flex-1 truncate">{webhookUrl}</code>
                    <button 
                      onClick={() => handleCopyText(webhookUrl, 'webhook')}
                      className="text-pistachio hover:text-primary transition-colors"
                    >
                      {copiedWebhook ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution logs */}
            <div className="bg-card/40 backdrop-blur-md border border-forest/20 rounded-2xl p-5 flex flex-col h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <Settings className="h-5 w-5" />
                  <h3 className="font-bold text-sm text-white">Atividades Recentes</h3>
                </div>
                <div className="bg-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2 text-pistachio/65">
                <div className="flex gap-2 border-l border-forest/20 pl-2">
                  <span className="text-primary/40">Agora</span>
                  <span>Sandbox ativa e aguardando comandos...</span>
                </div>
                <div className="flex gap-2 border-l border-forest/20 pl-2">
                  <span className="text-primary/40">10:43</span>
                  <span>Agente instanciado com sucesso.</span>
                </div>
                <div className="flex gap-2 border-l border-forest/20 pl-2">
                  <span className="text-primary/40">10:40</span>
                  <span>Ambiente sandbox carregado.</span>
                </div>
              </div>
            </div>

            {/* Monthly Limit */}
            <div className="bg-card/40 backdrop-blur-md border border-forest/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-pistachio/70 font-semibold uppercase tracking-wider text-[10px]">Quota de Uso Mensal</span>
                <span className="text-xs font-bold text-primary">82%</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-primary shadow-[0_0_10px_rgba(69,253,148,0.5)]" style={{ width: '82%' }}></div>
              </div>
              <p className="text-[10px] text-pistachio/50 text-right">3,284,102 / 4,000,000 Tokens</p>
            </div>

          </section>

        </div>
      </div>
    </AppLayout>
  );
}
