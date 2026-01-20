import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("user-api-keys", {
        body: {},
        headers: {},
      });

      // Add action as query param
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api-keys?action=list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setKeys(result.keys || []);
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api-keys?action=save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api-keys?action=delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
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
