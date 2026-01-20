import { User, Lock, CreditCard, LogOut } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Definições" credits={1250}>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Primeiro Nome</Label>
                    <Input id="firstName" defaultValue="João" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Último Nome</Label>
                    <Input id="lastName" defaultValue="Silva" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="joao@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" defaultValue="Acme Lda." />
                </div>
                <Button>Guardar Alterações</Button>
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
                  <Label htmlFor="currentPassword">Palavra-passe Atual</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Palavra-passe</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Atualizar Palavra-passe</Button>
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
                      <p className="font-medium">Plano Pro</p>
                      <p className="text-sm text-muted-foreground">
                        2.000 créditos/mês
                      </p>
                    </div>
                    <p className="text-xl font-bold">49€/mês</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Método de Pagamento</h4>
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expira 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline">Atualizar Método de Pagamento</Button>
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
          <CardContent>
            <Button variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Eliminar Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
