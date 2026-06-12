import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntegrationSettings {
  id?: string;
  email_provider: string;
  email_smtp_host: string | null;
  email_smtp_port: number | null;
  email_smtp_user: string | null;
  email_smtp_password: string | null;
  email_default_sender_name: string | null;
  email_default_sender_address: string | null;
  email_default_recipients: string | null;
  email_daily_limit: number;
  whatsapp_daily_limit: number;
  whatsapp_delay_min_seconds: number;
  whatsapp_delay_max_seconds: number;
  whatsapp_default_instance_key: string | null;
}

const DEFAULTS: IntegrationSettings = {
  email_provider: "smtp",
  email_smtp_host: null,
  email_smtp_port: 587,
  email_smtp_user: null,
  email_smtp_password: null,
  email_default_sender_name: null,
  email_default_sender_address: null,
  email_default_recipients: null,
  email_daily_limit: 500,
  whatsapp_daily_limit: 1000,
  whatsapp_delay_min_seconds: 5,
  whatsapp_delay_max_seconds: 15,
  whatsapp_default_instance_key: null,
};

export function useIntegrationSettings() {
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_integration_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({ ...DEFAULTS, ...data });
      }
    } catch (err) {
      console.error("Error fetching integration settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = async (updates: Partial<IntegrationSettings>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Precisas de estar autenticado");
        return false;
      }

      // Upsert — cria se não existir, atualiza se existir
      const { data, error } = await supabase
        .from("user_integration_settings")
        .upsert(
          { user_id: user.id, ...settings, ...updates },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      setSettings({ ...DEFAULTS, ...data });
      toast.success("Configurações guardadas com sucesso!");
      return true;
    } catch (err) {
      console.error("Error saving integration settings:", err);
      toast.error("Erro ao guardar configurações de integração");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSettings();
    });
    return () => subscription.unsubscribe();
  }, [fetchSettings]);

  return { settings, setSettings, isLoading, isSaving, saveSettings, refetch: fetchSettings };
}
