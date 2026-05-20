import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, Client } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientCard } from "@/components/clients/ClientCard";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Bot,
  Globe,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { clientsWithStats, isLoading, stats, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clientsWithStats.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  return (
    <AppLayout pageTitle="Clientes" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Mensal"
            value={`${stats.totalMonthlyRevenue.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} MZN`}
            icon={DollarSign}
            trend={{ value: 12, isPositive: true }}
            description="Total de todos os clientes"
          />
          <StatCard
            title="Clientes Ativos"
            value={stats.activeClients}
            icon={Users}
            description={`De ${clientsWithStats.length} total`}
          />
          <StatCard
            title="Agentes Vendidos"
            value={stats.totalAgents}
            icon={Bot}
            trend={{ value: 8, isPositive: true }}
            description="Atribuídos a clientes"
          />
          <StatCard
            title="Sites Criados"
            value={stats.totalWebsites}
            icon={Globe}
            description="Para clientes"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description={
              searchQuery
                ? "Tente ajustar a sua pesquisa"
                : "Comece a adicionar clientes para gerir os seus agentes e sites"
            }
            action={
              !searchQuery ? {
                label: "Adicionar Primeiro Cliente",
                onClick: () => setCreateDialogOpen(true),
              } : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEdit}
                onDelete={setClientToDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateClientDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
        title="Eliminar Cliente"
        description={`Tem a certeza que deseja eliminar "${clientToDelete?.name}"? Esta ação não pode ser revertida. Os agentes e sites associados não serão eliminados, apenas desvinculados.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteClient.isPending}
      />
    </AppLayout>
  );
}
