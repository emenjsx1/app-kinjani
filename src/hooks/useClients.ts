import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  status: string;
  plan: string;
  monthly_value: number;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  agents_count?: number;
  websites_count?: number;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  status?: string;
  plan?: string;
  monthly_value?: number;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

export function useClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user?.id,
  });

  // Get clients with agent/website counts
  const { data: clientsWithStats = [] } = useQuery({
    queryKey: ["clients-with-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      // Fetch agents with client_id
      const { data: agentsData } = await supabase
        .from("agents")
        .select("id, client_id")
        .eq("user_id", user.id);

      // Fetch websites with client_id
      const { data: websitesData } = await supabase
        .from("websites")
        .select("id, client_id")
        .eq("user_id", user.id);

      // Count per client
      const clientsWithCounts = clientsData.map((client) => ({
        ...client,
        agents_count: agentsData?.filter((a) => a.client_id === client.id).length || 0,
        websites_count: websitesData?.filter((w) => w.client_id === client.id).length || 0,
      }));

      return clientsWithCounts as Client[];
    },
    enabled: !!user?.id,
  });

  const createClient = useMutation({
    mutationFn: async (data: CreateClientData) => {
      if (!user?.id) throw new Error("Utilizador não autenticado");

      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-with-stats"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...data }: UpdateClientData) => {
      const { data: updated, error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-with-stats"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-with-stats"] });
      toast.success("Cliente removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover cliente: " + error.message);
    },
  });

  // Calculate total stats
  const totalMonthlyRevenue = clientsWithStats.reduce(
    (sum, c) => sum + Number(c.monthly_value || 0),
    0
  );
  const activeClients = clientsWithStats.filter((c) => c.status === "active").length;
  const totalAgents = clientsWithStats.reduce((sum, c) => sum + (c.agents_count || 0), 0);
  const totalWebsites = clientsWithStats.reduce((sum, c) => sum + (c.websites_count || 0), 0);

  return {
    clients,
    clientsWithStats,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    stats: {
      totalMonthlyRevenue,
      activeClients,
      totalAgents,
      totalWebsites,
    },
  };
}
