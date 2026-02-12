import { Coins, CreditCard, TrendingDown, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageBar, UsageTable } from "@/components/ui/usage-bar";
import { useProfile } from "@/hooks/useProfile";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function CreditsPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading, getUsageThisMonth, getUsageByCategory } = useCredits();

  const isLoading = profileLoading || transactionsLoading;
  const usageThisMonth = getUsageThisMonth();
  const usageByCategory = getUsageByCategory();

  // Transform transactions for the table
  const usageHistory = transactions.map(t => ({
    id: t.id,
    date: format(new Date(t.created_at), "dd MMM, yyyy", { locale: pt }),
    action: t.action + (t.description ? ` - ${t.description}` : ''),
    credits: t.amount,
  }));

  // Get next billing date (first of next month)
  const getNextBillingDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return format(nextMonth, "d MMM", { locale: pt });
  };

  // Calculate monthly limit based on plan
  const getMonthlyLimit = () => {
    switch (profile?.plan) {
      case 'pro': return 2000;
      case 'business': return 5000;
      default: return 500;
    }
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Créditos" credits={0}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  const monthlyLimit = getMonthlyLimit();

  return (
    <AppLayout pageTitle="Créditos" credits={profile?.credits_balance || 0}>
      <div className="space-y-6">
        {/* Visão Geral dos Créditos */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Saldo Atual"
            value={(profile?.credits_balance || 0).toLocaleString()}
            icon={Coins}
            variant="primary"
            description="créditos disponíveis"
          />
          <StatCard
            title="Usados Este Mês"
            value={usageThisMonth.toLocaleString()}
            icon={TrendingDown}
            description={`de ${monthlyLimit.toLocaleString()} mensais`}
          />
          <StatCard
            title="Próxima Faturação"
            value={getNextBillingDate()}
            icon={CreditCard}
            description="Renovação mensal"
          />
        </div>

        {/* Progresso de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Uso Mensal</CardTitle>
            <CardDescription>
              O seu consumo de créditos neste período de faturação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsageBar
              used={usageThisMonth}
              total={monthlyLimit}
              label="Créditos Usados"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {usageByCategory.length > 0 ? (
                usageByCategory.slice(0, 3).map((category, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{category.value}</p>
                    <p className="text-sm text-muted-foreground">{category.name}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">Chats de Agentes</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">Geração de Sites</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">Criação de Agentes</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comprar Créditos */}
        <Card>
          <CardHeader>
            <CardTitle>Comprar Mais Créditos</CardTitle>
            <CardDescription>
              Escolha um pacote de créditos que se adeque às suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">500</p>
                  <p className="text-muted-foreground mb-4">créditos</p>
                  <p className="text-xl font-semibold text-primary">499 MT</p>
                  <Button className="w-full mt-4" variant="outline">
                    Comprar
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary relative hover:shadow-lg cursor-pointer transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </div>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">1.500</p>
                  <p className="text-muted-foreground mb-4">créditos</p>
                  <p className="text-xl font-semibold text-primary">1.299 MT</p>
                  <Button className="w-full mt-4">
                    Comprar
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">5.000</p>
                  <p className="text-muted-foreground mb-4">créditos</p>
                  <p className="text-xl font-semibold text-primary">3.999 MT</p>
                  <Button className="w-full mt-4" variant="outline">
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Uso</CardTitle>
            <CardDescription>
              Transações e uso de créditos recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageHistory.length > 0 ? (
              <UsageTable data={usageHistory} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação registada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
