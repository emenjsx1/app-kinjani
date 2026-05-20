import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { GmailIcon } from "@/components/integrations/BrandIcons";
import { toast } from "sonner";

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email_daily_limit: 500,
    email_default_sender_name: "",
    email_default_sender_address: "",
    email_default_recipients: "",
    email_provider: "lovable",
    email_smtp_host: "",
    email_smtp_port: 587,
    email_smtp_user: "",
    email_smtp_password: "",
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
        email_daily_limit: data.email_daily_limit ?? 500,
        email_default_sender_name: data.email_default_sender_name ?? "",
        email_default_sender_address: data.email_default_sender_address ?? "",
        email_default_recipients: data.email_default_recipients ?? "",
        email_provider: data.email_provider ?? "lovable",
        email_smtp_host: data.email_smtp_host ?? "",
        email_smtp_port: data.email_smtp_port ?? 587,
        email_smtp_user: data.email_smtp_user ?? "",
        email_smtp_password: data.email_smtp_password ?? "",
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

  const isSmtp = form.email_provider === "smtp";

  return (
    <AppLayout pageTitle="Email · Configurações" credits={profile?.credits_balance || 0}>
      <div className="max-w-3xl space-y-4">
        <Link to="/integrations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Voltar a Integrações
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GmailIcon className="h-8 w-8" />
              <div>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>Remetente, destinatários padrão, limites e provedor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="space-y-2">
                  <Label>Provedor de envio</Label>
                  <Select value={form.email_provider} onValueChange={(v) => setForm({ ...form, email_provider: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lovable">Kinjani (padrão)</SelectItem>
                      <SelectItem value="smtp">SMTP personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome do remetente</Label>
                    <Input placeholder="Ex: Equipa Kinjani" value={form.email_default_sender_name} onChange={(e) => setForm({ ...form, email_default_sender_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email do remetente</Label>
                    <Input type="email" placeholder="contacto@dominio.com" value={form.email_default_sender_address} onChange={(e) => setForm({ ...form, email_default_sender_address: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destinatários padrão (BCC)</Label>
                  <Textarea rows={2} placeholder="email1@ex.com, email2@ex.com" value={form.email_default_recipients} onChange={(e) => setForm({ ...form, email_default_recipients: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Separados por vírgula. Recebem cópia oculta de cada envio</p>
                </div>

                <div className="space-y-2">
                  <Label>Limite diário</Label>
                  <Input type="number" min={1} value={form.email_daily_limit} onChange={(e) => setForm({ ...form, email_daily_limit: Number(e.target.value) })} />
                </div>

                {isSmtp && (
                  <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm font-medium">SMTP personalizado</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2 col-span-2">
                        <Label>Host</Label>
                        <Input placeholder="smtp.gmail.com" value={form.email_smtp_host} onChange={(e) => setForm({ ...form, email_smtp_host: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Porta</Label>
                        <Input type="number" value={form.email_smtp_port} onChange={(e) => setForm({ ...form, email_smtp_port: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Utilizador</Label>
                        <Input value={form.email_smtp_user} onChange={(e) => setForm({ ...form, email_smtp_user: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Palavra-passe</Label>
                        <Input type="password" value={form.email_smtp_password} onChange={(e) => setForm({ ...form, email_smtp_password: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

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
