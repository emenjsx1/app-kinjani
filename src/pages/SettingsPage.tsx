import { useState } from "react";
import { User, Lock, CreditCard, LogOut, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize form values when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompany(profile.company || "");
      setEmail(profile.email || "");
    }
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        company: company,
      });
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As palavras-passe não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Palavra-passe atualizada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao atualizar palavra-passe");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Plano Pro';
      case 'business': return 'Plano Business';
      default: return 'Plano Gratuito';
    }
  };

  const getPlanCredits = (plan: string) => {
    switch (plan) {
      case 'pro': return '2.000 créditos/mês';
      case 'business': return '5.000 créditos/mês';
      default: return '500 créditos/mês';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'pro': return '49€/mês';
      case 'business': return '99€/mês';
      default: return 'Gratuito';
    }
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Definições" credits={0}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Definições" credits={profile?.credits_balance || 0}>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="h-4 w-4" />
              Palavra-passe
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Faturação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Definições do Perfil</CardTitle>
                <CardDescription>
                  Gerir as informações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input 
                    id="fullName" 
                    value={fullName || profile?.full_name || ""} 
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email || profile?.email || ""} 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input 
                    id="company" 
                    value={company || profile?.company || ""} 
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    "Guardar Alterações"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Palavra-passe</CardTitle>
                <CardDescription>
                  Atualize a sua palavra-passe para manter a conta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdatePassword} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A atualizar...
                    </>
                  ) : (
                    "Atualizar Palavra-passe"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Faturação</CardTitle>
                <CardDescription>
                  Gerir a sua subscrição e métodos de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{getPlanName(profile?.plan || 'free')}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPlanCredits(profile?.plan || 'free')}
                      </p>
                    </div>
                    <p className="text-xl font-bold">{getPlanPrice(profile?.plan || 'free')}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Saldo de Créditos</p>
                      <p className="text-sm text-muted-foreground">Créditos disponíveis na sua conta</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {(profile?.credits_balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Atualizar Plano</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className={`border-2 cursor-pointer transition-colors ${profile?.plan === 'pro' ? 'border-primary' : 'hover:border-primary/50'}`}>
                      <CardContent className="pt-4">
                        <p className="font-medium">Plano Pro</p>
                        <p className="text-sm text-muted-foreground">2.000 créditos/mês</p>
                        <p className="text-lg font-bold mt-2">49€/mês</p>
                      </CardContent>
                    </Card>
                    <Card className={`border-2 cursor-pointer transition-colors ${profile?.plan === 'business' ? 'border-primary' : 'hover:border-primary/50'}`}>
                      <CardContent className="pt-4">
                        <p className="font-medium">Plano Business</p>
                        <p className="text-sm text-muted-foreground">5.000 créditos/mês</p>
                        <p className="text-lg font-bold mt-2">99€/mês</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Zona de Perigo */}
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Terminar Sessão
            </Button>
            <Button variant="destructive">
              Eliminar Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
