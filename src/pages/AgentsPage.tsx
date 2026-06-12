import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Bot, MessageSquare, Settings, Edit3, Trash2, Zap, Copy, Filter, Code } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateAgentWizard } from "@/components/agents/CreateAgentWizard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useAgents, Agent } from "@/hooks/useAgents";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProfile } from "@/hooks/useProfile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AgentsPage() {
  const navigate = useNavigate();
  const { agents, isLoading, createAgent, deleteAgent } = useAgents();
  const { instances } = useWhatsAppInstances();
  const { profile } = useProfile();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle'>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && agent.status === 'active';
    if (statusFilter === 'idle') return matchesSearch && agent.status !== 'active';
    return matchesSearch;
  });

  const getChannelBadge = (channel: Agent["channel"]) => {
    const config = {
      whatsapp: { label: "WhatsApp", className: "bg-green-500/10 text-green-400 border-green-500/20" },
      embed: { label: "Embed", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      both: { label: "Ambos", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    };
    const { label, className } = config[channel];
    return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>;
  };

  const getInstanceName = (instanceId: string | null) => {
    if (!instanceId) return null;
    const instance = instances.find(i => i.id === instanceId);
    return instance ? instance.instance_name : null;
  };

  const handleAgentCreated = async (newAgentData: {
    id: string;
    name: string;
    type: string;
    typeId: string;
    prompt: string;
    status: 'active' | 'inactive' | 'pending' | 'error';
    channel: 'whatsapp' | 'embed' | 'both';
    messagesHandled: number;
    createdAt: string;
    instanceId?: string | null;
  }) => {
    const result = await createAgent({
      name: newAgentData.name,
      type: newAgentData.type,
      type_id: newAgentData.typeId,
      prompt: newAgentData.prompt,
      channel: newAgentData.channel,
      status: 'inactive',
      messages_handled: 0,
      instance_id: newAgentData.instanceId || null,
    });
    
    if (result) {
      toast.success(`Agente "${result.name}" criado com sucesso!`);
    } else {
      toast.error("Erro ao criar agente");
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (agentToDelete) {
      const success = await deleteAgent(agentToDelete.id);
      if (success) {
        toast.success(`Agente "${agentToDelete.name}" eliminado`);
      } else {
        toast.error("Erro ao eliminar agente");
      }
      setAgentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleCardClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Agentes" credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <AppLayout pageTitle="Fábrica de Agentes" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
              Gerenciador de Agentes
            </h1>
            <p className="text-sm text-pistachio max-w-xl">
              Visualize e gerencie seu esquadrão de inteligências criativas ativas. Otimize fluxos de trabalho através da orquestração de agentes especializados.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#021f1b]/60 backdrop-blur-md flex items-center px-4 py-2 rounded-full border border-forest/30">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                {activeCount} {activeCount === 1 ? 'Agente' : 'Agentes'} Online
              </span>
            </div>
          </div>
        </header>

        {/* Action Bar & Filters */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#021f1b]/40 backdrop-blur-md p-4 rounded-2xl border border-forest/30">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pistachio/50 h-4 w-4" />
              <Input
                className="w-full bg-[#011612]/50 border border-forest/30 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-pistachio/30"
                placeholder="Buscar agentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex bg-background/50 p-1 rounded-lg border border-forest/30 w-full sm:w-auto justify-center">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-forest/40 text-primary border border-forest/35'
                    : 'text-pistachio hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-forest/40 text-primary border border-forest/35'
                    : 'text-pistachio hover:text-white'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setStatusFilter('idle')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === 'idle'
                    ? 'bg-forest/40 text-primary border border-forest/35'
                    : 'text-pistachio hover:text-white'
                }`}
              >
                Ociosos
              </button>
            </div>
            <Button
              onClick={() => setWizardOpen(true)}
              className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-background font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_-2px_rgba(69,253,148,0.3)] border border-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Agente</span>
            </Button>
          </div>
        </section>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <Card className="bg-[#021f1b]/20 border border-forest/20 py-16">
            <CardContent>
              <EmptyState
                icon={Bot}
                title="Nenhum agente encontrado"
                description={search ? "Tente ajustar os termos de pesquisa ou filtros" : "Crie o seu primeiro agente IA para começar"}
                action={search ? undefined : {
                  label: "Criar Agente",
                  onClick: () => setWizardOpen(true),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => {
              const instanceName = getInstanceName(agent.instance_id);
              const isActive = agent.status === 'active';
              return (
                <div
                  key={agent.id}
                  onClick={() => handleCardClick(agent.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-forest/30 bg-[#021f1b]/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_0_30px_-10px_rgba(69,253,148,0.2)] holographic-card"
                >
                  <div>
                    {/* Card Top Actions & Status */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl border border-forest/30 bg-background/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                          <Bot className="h-8 w-8" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-background border border-forest/30 rounded-full p-1 flex items-center justify-center">
                          <span className={`relative flex h-2 w-2`}>
                            {isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-primary' : 'bg-pistachio/40'}`}></span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-pistachio hover:text-white hover:bg-forest/20">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#021713] border-forest/30 text-white">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agents/${agent.id}`);
                          }}>
                            <Edit3 className="mr-2 h-4 w-4 text-pistachio" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agents/${agent.id}?tab=test`);
                          }}>
                            <Zap className="mr-2 h-4 w-4 text-primary" />
                            Testar Agente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agents/${agent.id}?tab=embed`);
                          }}>
                            <Copy className="mr-2 h-4 w-4 text-pistachio" />
                            Copiar Código Embed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-forest/20" />
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgent(agent);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Agent Name & Type */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">
                        {agent.name}
                      </h3>
                      <p className="text-xs font-semibold tracking-wider text-pistachio/70 uppercase font-display mt-0.5">
                        {agent.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Instance Info & Channels */}
                    <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-forest/10">
                      <div>
                        {getChannelBadge(agent.channel)}
                      </div>
                      
                      {agent.channel === 'whatsapp' && (
                        <div className="text-xs text-pistachio/60">
                          {instanceName ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                                    <MessageSquare className="h-3.5 w-3.5 text-green-400" />
                                    <span className="truncate max-w-[100px]">{instanceName}</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-surface border-forest/30 text-white">
                                  <p>Instância: {instanceName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-xs text-pistachio/40">Não configurada</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Messages Stats */}
                    <div className="flex justify-between items-center pt-2 text-xs">
                      <span className="text-pistachio/60">Mensagens</span>
                      <span className="font-mono text-white font-semibold">
                        {agent.messages_handled.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* New Agent Card Button Placeholder */}
            <button
              onClick={() => setWizardOpen(true)}
              className="border-2 border-dashed border-forest/30 rounded-2xl flex flex-col items-center justify-center p-6 group hover:border-primary/50 hover:bg-white/5 transition-all duration-300 min-h-[260px] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-forest/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="text-base font-bold text-pistachio group-hover:text-primary transition-colors">
                Novo Agente
              </span>
              <p className="text-xs text-pistachio/40 mt-2 max-w-[200px]">
                Adicione uma nova inteligência especializada ao seu time.
              </p>
            </button>
          </section>
        )}

        {/* Metrics Footer (Stats Section) */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#021f1b]/40 backdrop-blur-md border border-forest/20 p-6 rounded-2xl col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-forest/10" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="6"></circle>
                <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-dasharray="364.4" stroke-dashoffset="100" stroke-linecap="round" stroke-width="6"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-primary font-display">72%</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-pistachio/70">Otimização</span>
              </div>
            </div>
            <div className="space-y-4 text-center sm:text-left">
              <h4 className="text-lg font-bold text-white">Performance do Esquadrão</h4>
              <div className="space-y-1 text-sm text-pistachio">
                <p>Seus agentes processaram <strong className="text-white">1.2M tokens</strong> nas últimas 24 horas.</p>
                <p className="text-xs text-pistachio/70 flex items-center justify-center sm:justify-start gap-1">
                  <span className="text-primary">✦</span> Economia de <strong>42%</strong> em relação a processamentos manuais.
                </p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold uppercase tracking-wider text-pistachio/60">
                <span className="text-primary">▲ +12.4% este mês</span>
                <span>• Latência: 24ms</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#021f1b]/40 backdrop-blur-md border border-forest/20 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Faturamento & Uso</h4>
                <p className="text-xs text-pistachio mt-1">Plano atual: <span className="text-primary font-bold">Pro Factory</span></p>
              </div>
              <Button
                variant="outline"
                className="w-full bg-[#011612]/50 border-forest/30 text-primary hover:bg-forest/20 text-xs font-semibold py-2"
                onClick={() => navigate('/settings')}
              >
                Configurações de Faturamento
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <Bot className="h-32 w-32 text-primary" />
            </div>
          </div>
        </section>
      </div>

      {/* Wizard de Criar Agente */}
      <CreateAgentWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onAgentCreated={handleAgentCreated}
      />

      {/* Diálogo de Confirmação de Eliminação */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Agente"
        description={`Tem a certeza que deseja eliminar "${agentToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
