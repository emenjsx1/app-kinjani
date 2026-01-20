import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = "https://mpxsivfiltwvnvqtixuo.supabase.co";

interface ApiKeyInfo {
  id: string;
  provider: string;
  is_valid: boolean;
  hasKey: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserApiKeys() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.log("No auth token available - user not logged in");
        setKeys([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/user-api-keys?action=list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setKeys(result.keys || []);
      } else {
        console.error("Error fetching API keys:", result.error);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveKey = async (provider: string, apiKey: string) => {
    setIsSaving(true);
    try {
      const token = await getAuthToken();
      
      if (!token) {
        toast.error("Precisa de estar autenticado para guardar chaves de API");
        return false;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/user-api-keys?action=save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ provider, apiKey }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Chave de API guardada com sucesso!");
        await fetchKeys();
        return true;
      } else {
        toast.error(result.error || "Erro ao guardar chave de API");
        return false;
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Erro ao guardar chave de API");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteKey = async (provider: string) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        toast.error("Precisa de estar autenticado para remover chaves de API");
        return false;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/user-api-keys?action=delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ provider }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Chave de API removida com sucesso!");
        await fetchKeys();
        return true;
      } else {
        toast.error(result.error || "Erro ao remover chave de API");
        return false;
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Erro ao remover chave de API");
      return false;
    }
  };

  const hasKey = (provider: string) => {
    return keys.some((k) => k.provider === provider && k.hasKey);
  };

  useEffect(() => {
    fetchKeys();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchKeys();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    keys,
    isLoading,
    isSaving,
    saveKey,
    deleteKey,
    hasKey,
    refetch: fetchKeys,
  };
}
