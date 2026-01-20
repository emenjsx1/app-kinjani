import { Coins, CreditCard, TrendingDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageBar, UsageTable } from "@/components/ui/usage-bar";

const usageHistory = [
  { id: "1", date: "20 Jan, 2024", action: "Chat Agente - Bot Vendas", credits: -15 },
  { id: "2", date: "20 Jan, 2024", action: "Geração de Site", credits: -50 },
  { id: "3", date: "19 Jan, 2024", action: "Compra de Créditos", credits: 500 },
  { id: "4", date: "19 Jan, 2024", action: "Chat Agente - Bot FAQ", credits: -8 },
  { id: "5", date: "18 Jan, 2024", action: "Criação de Novo Agente", credits: -25 },
  { id: "6", date: "18 Jan, 2024", action: "Chat Agente - Suporte", credits: -12 },
];

export default function CreditsPage() {
  return (
    <AppLayout pageTitle="Créditos" credits={1250}>
      <div className="space-y-6">
        {/* Visão Geral dos Créditos */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Saldo Atual"
            value="1.250"
            icon={Coins}
            variant="primary"
            description="créditos disponíveis"
          />
          <StatCard
            title="Usados Este Mês"
            value="750"
            icon={TrendingDown}
            description="de 2.000 mensais"
          />
          <StatCard
            title="Próxima Faturação"
            value="1 Fev"
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
              used={750}
              total={2000}
              label="Créditos Usados"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">450</p>
                <p className="text-sm text-muted-foreground">Chats de Agentes</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">200</p>
                <p className="text-sm text-muted-foreground">Geração de Sites</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">100</p>
                <p className="text-sm text-muted-foreground">Chamadas API</p>
              </div>
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
                  <p className="text-xl font-semibold text-primary">9,99€</p>
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
                  <p className="text-xl font-semibold text-primary">24,99€</p>
                  <Button className="w-full mt-4">
                    Comprar
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">5.000</p>
                  <p className="text-muted-foreground mb-4">créditos</p>
                  <p className="text-xl font-semibold text-primary">69,99€</p>
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
            <UsageTable data={usageHistory} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
