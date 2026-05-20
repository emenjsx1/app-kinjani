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

async function invokeFn(action: string, body: any = {}) {
  const { data, error } = await supabase.functions.invoke(
    `user-api-keys?action=${action}`,
    { body }
  );
  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

export function useUserApiKeys() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setKeys([]);
        return;
      }
      const result = await invokeFn("list");
      if (result?.success) {
        setKeys(result.keys || []);
      } else if (result?.error) {
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Precisa de estar autenticado para guardar chaves de API");
        return false;
      }
      const result = await invokeFn("save", { provider, apiKey });
      if (result?.success) {
        toast.success("Chave de API guardada com sucesso!");
        await fetchKeys();
        return true;
      }
      toast.error(result?.error || "Erro ao guardar chave de API");
      return false;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Precisa de estar autenticado para remover chaves de API");
        return false;
      }
      const result = await invokeFn("delete", { provider });
      if (result?.success) {
        toast.success("Chave de API removida com sucesso!");
        await fetchKeys();
        return true;
      }
      toast.error(result?.error || "Erro ao remover chave de API");
      return false;
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
