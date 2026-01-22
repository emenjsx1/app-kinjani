import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Bot, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const getChannelBadge = (channel: Agent["channel"]) => {
    const config = {
      whatsapp: { label: "WhatsApp", className: "bg-green-500/10 text-green-600" },
      embed: { label: "Embed", className: "bg-blue-500/10 text-blue-600" },
      both: { label: "Ambos", className: "bg-purple-500/10 text-purple-600" },
    };
    const { label, className } = config[channel];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // Get instance name by ID
  const getInstanceName = (instanceId: string | null) => {
    if (!instanceId) return null;
    const instance = instances.find(i => i.id === instanceId);
    return instance ? instance.instance_name : null;
  };

  // Accept the wizard's Agent format (camelCase) and convert to hook format (snake_case)
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

  const handleRowClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Agentes" credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Agentes" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Ações do Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar agentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Agente
          </Button>
        </div>

        {/* Tabela de Agentes */}
        <Card>
          <CardHeader>
            <CardTitle>Os Seus Agentes</CardTitle>
            <CardDescription>
              Gerir e monitorizar todos os seus agentes IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="Nenhum agente encontrado"
                description="Crie o seu primeiro agente IA para começar"
                action={{
                  label: "Criar Agente",
                  onClick: () => setWizardOpen(true),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Instância</TableHead>
                    <TableHead className="text-right">Mensagens</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => {
                    const instanceName = getInstanceName(agent.instance_id);
                    return (
                      <TableRow 
                        key={agent.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(agent.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            {agent.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {agent.type}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={agent.status} />
                        </TableCell>
                        <TableCell>{getChannelBadge(agent.channel)}</TableCell>
                        <TableCell>
                          {agent.channel === 'whatsapp' && instanceName ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-sm truncate max-w-[120px]">{instanceName}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Instância: {instanceName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : agent.channel === 'whatsapp' ? (
                            <span className="text-xs text-muted-foreground">Não configurada</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {agent.messages_handled.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/agents/${agent.id}`);
                              }}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/agents/${agent.id}?tab=test`);
                              }}>
                                Testar Agente
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/agents/${agent.id}?tab=embed`);
                              }}>
                                Copiar Código Embed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAgent(agent);
                                }}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
