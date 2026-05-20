import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { WhatsAppIcon } from "@/components/integrations/BrandIcons";
import { toast } from "sonner";

export default function WhatsAppSettingsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { instances } = useWhatsAppInstances();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    whatsapp_daily_limit: 200,
    whatsapp_delay_min_seconds: 3,
    whatsapp_delay_max_seconds: 5,
    whatsapp_default_instance_key: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("user_integration_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setForm({
        whatsapp_daily_limit: data.whatsapp_daily_limit ?? 200,
        whatsapp_delay_min_seconds: data.whatsapp_delay_min_seconds ?? 3,
        whatsapp_delay_max_seconds: data.whatsapp_delay_max_seconds ?? 5,
        whatsapp_default_instance_key: data.whatsapp_default_instance_key ?? "",
      });
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("user_integration_settings")
      .upsert({ user_id: user.id, ...form }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error("Erro ao guardar");
    else toast.success("Definições guardadas");
  };

  return (
    <AppLayout pageTitle="WhatsApp · Configurações" credits={profile?.credits_balance || 0}>
      <div className="max-w-3xl space-y-4">
        <Link to="/integrations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Voltar a Integrações
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <WhatsAppIcon className="h-8 w-8" />
              <div>
                <CardTitle>Configurações WhatsApp</CardTitle>
                <CardDescription>Limites de envio, atrasos e instância padrão</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="space-y-2">
                  <Label>Instância padrão</Label>
                  <Select value={form.whatsapp_default_instance_key || "none"} onValueChange={(v) => setForm({ ...form, whatsapp_default_instance_key: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Escolha uma instância" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {instances.map((i) => (
                        <SelectItem key={i.instance_key} value={i.instance_key!}>{i.instance_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Usada por padrão em automações e blasts</p>
                </div>

                <div className="space-y-2">
                  <Label>Limite diário de mensagens</Label>
                  <Input type="number" min={1} value={form.whatsapp_daily_limit} onChange={(e) => setForm({ ...form, whatsapp_daily_limit: Number(e.target.value) })} />
                  <p className="text-xs text-muted-foreground">Recomendado: até 250/dia para evitar bloqueios</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Atraso mínimo (segundos)</Label>
                    <Input type="number" min={1} value={form.whatsapp_delay_min_seconds} onChange={(e) => setForm({ ...form, whatsapp_delay_min_seconds: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Atraso máximo (segundos)</Label>
                    <Input type="number" min={1} value={form.whatsapp_delay_max_seconds} onChange={(e) => setForm({ ...form, whatsapp_delay_max_seconds: Number(e.target.value) })} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">Atraso aleatório entre 3–5s evita banimento</p>

                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
