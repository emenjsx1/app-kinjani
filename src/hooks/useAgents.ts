import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  type: string;
  type_id: string | null;
  prompt: string | null;
  status: 'active' | 'inactive' | 'pending' | 'error';
  channel: 'whatsapp' | 'embed' | 'both';
  messages_handled: number;
  created_at: string;
  updated_at: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAgents([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to properly typed agents
      const typedAgents: Agent[] = (data || []).map(agent => ({
        ...agent,
        status: agent.status as Agent['status'],
        channel: agent.channel as Agent['channel'],
      }));

      setAgents(typedAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (agent: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...agent,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const typedAgent: Agent = {
        ...data,
        status: data.status as Agent['status'],
        channel: data.channel as Agent['channel'],
      };

      setAgents(prev => [typedAgent, ...prev]);
      return typedAgent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      return null;
    }
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedAgent: Agent = {
        ...data,
        status: data.status as Agent['status'],
        channel: data.channel as Agent['channel'],
      };

      setAgents(prev => prev.map(a => a.id === id ? typedAgent : a));
      return typedAgent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent');
      return null;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgents(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
      return false;
    }
  };

  const getAgent = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        status: data.status as Agent['status'],
        channel: data.channel as Agent['channel'],
      } as Agent;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    fetchAgents();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAgents();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    agents,
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    refetch: fetchAgents,
  };
}
