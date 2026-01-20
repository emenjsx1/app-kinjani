import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppInstance {
  id: string;
  user_id: string;
  agent_id: string | null;
  instance_name: string;
  instance_key: string | null;
  phone_number: string | null;
  status: 'disconnected' | 'connecting' | 'connected';
  qr_code: string | null;
  webhook_url: string | null;
  is_for_client: boolean;
  client_token: string | null;
  created_at: string;
  connected_at: string | null;
}

export function useWhatsAppInstances() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setInstances([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedInstances: WhatsAppInstance[] = (data || []).map(instance => ({
        ...instance,
        status: instance.status as WhatsAppInstance['status'],
      }));

      setInstances(typedInstances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances');
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async (instanceName: string, agentId?: string, isForClient?: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      
      const res = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ instanceName, agentId, isForClient }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create instance');
      }

      const data = await res.json();

      // Refresh instances list
      await fetchInstances();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance');
      throw err;
    }
  };

  const getQRCode = async (instanceKey: string) => {
    try {
      const response = await supabase.functions.invoke('whatsapp-instance', {
        body: {},
        headers: {},
      });

      // Use fetch directly for query params
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      
      const res = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=qrcode&instance=${instanceKey}`,
        {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        }
      );

      if (!res.ok) throw new Error('Failed to get QR code');

      return await res.json();
    } catch (err) {
      console.error('Error getting QR code:', err);
      return null;
    }
  };

  const getStatus = async (instanceKey: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      
      const res = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=status&instance=${instanceKey}`,
        {
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : {},
        }
      );

      if (!res.ok) throw new Error('Failed to get status');

      const data = await res.json();

      // Update local state
      if (data.status) {
        setInstances(prev => prev.map(inst => 
          inst.instance_key === instanceKey 
            ? { ...inst, status: data.status }
            : inst
        ));
      }

      return data;
    } catch (err) {
      console.error('Error getting status:', err);
      return null;
    }
  };

  const deleteInstance = async (instanceKey: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      
      const res = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=delete&instance=${instanceKey}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to delete instance');

      // Remove from local state
      setInstances(prev => prev.filter(inst => inst.instance_key !== instanceKey));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete instance');
      return false;
    }
  };

  const getClientConnectUrl = (clientToken: string) => {
    return `${window.location.origin}/connect/${clientToken}`;
  };

  useEffect(() => {
    fetchInstances();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchInstances();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    instances,
    isLoading,
    error,
    createInstance,
    getQRCode,
    getStatus,
    deleteInstance,
    getClientConnectUrl,
    refetch: fetchInstances,
  };
}
