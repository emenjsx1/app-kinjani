import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { useAgents } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Bot,
  Globe,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const chartConfig: ChartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
  clients: {
    label: "Clientes",
    color: "hsl(var(--chart-2))",
  },
  agents: {
    label: "Agentes",
    color: "hsl(var(--chart-3))",
  },
  websites: {
    label: "Websites",
    color: "hsl(var(--chart-4))",
  },
  messages: {
    label: "Mensagens",
    color: "hsl(var(--chart-5))",
  },
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ReportsPage() {
  const { profile } = useProfile();
  const { clientsWithStats, isLoading: clientsLoading, stats } = useClients();
  const { agents, isLoading: agentsLoading } = useAgents();

  const isLoading = clientsLoading || agentsLoading;

  // Calculate monthly revenue data
  const revenueData = useMemo(() => {
    if (clientsWithStats.length === 0) return [];

    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Count clients created before or during this month
      const activeClientsInMonth = clientsWithStats.filter((client) => {
        const createdDate = parseISO(client.created_at);
        return createdDate <= monthEnd && client.status === "active";
      });

      const revenue = activeClientsInMonth.reduce(
        (sum, c) => sum + Number(c.monthly_value || 0),
        0
      );

      return {
        month: format(month, "MMM", { locale: pt }),
        fullMonth: format(month, "MMMM yyyy", { locale: pt }),
        revenue,
        clients: activeClientsInMonth.length,
      };
    });
  }, [clientsWithStats]);

  // Calculate client growth data
  const clientGrowthData = useMemo(() => {
    if (clientsWithStats.length === 0) return [];

    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const newClients = clientsWithStats.filter((client) => {
        const createdDate = parseISO(client.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      const totalClients = clientsWithStats.filter((client) => {
        const createdDate = parseISO(client.created_at);
        return createdDate <= monthEnd;
      }).length;

      return {
        month: format(month, "MMM", { locale: pt }),
        fullMonth: format(month, "MMMM yyyy", { locale: pt }),
        novos: newClients,
        total: totalClients,
      };
    });
  }, [clientsWithStats]);

  // Calculate client distribution by plan
  const planDistribution = useMemo(() => {
    const plans: Record<string, number> = {};

    clientsWithStats.forEach((client) => {
      const plan = client.plan || "basic";
      plans[plan] = (plans[plan] || 0) + 1;
    });

    return Object.entries(plans).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [clientsWithStats]);

  // Top clients by revenue
  const topClients = useMemo(() => {
    return [...clientsWithStats]
      .sort((a, b) => Number(b.monthly_value || 0) - Number(a.monthly_value || 0))
      .slice(0, 5)
      .map((client) => ({
        name: client.name,
        revenue: Number(client.monthly_value || 0),
        agents: client.agents_count || 0,
        websites: client.websites_count || 0,
      }));
  }, [clientsWithStats]);

  // Messages by agent type
  const messagesByType = useMemo(() => {
    const types: Record<string, number> = {};

    agents.forEach((agent) => {
      const type = agent.type || "Outro";
      types[type] = (types[type] || 0) + agent.messages_handled;
    });

    return Object.entries(types).map(([name, value]) => ({
      name,
      value,
    }));
  }, [agents]);

  // Calculate growth percentages
  const currentMonthRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueData[revenueData.length - 2]?.revenue || 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

  const currentMonthClients = clientGrowthData[clientGrowthData.length - 1]?.novos || 0;
  const previousMonthClients = clientGrowthData[clientGrowthData.length - 2]?.novos || 0;
  const clientGrowth =
    previousMonthClients > 0
      ? ((currentMonthClients - previousMonthClients) / previousMonthClients) * 100
      : currentMonthClients > 0
      ? 100
      : 0;

  if (isLoading) {
    return (
      <AppLayout pageTitle="Relatórios" credits={profile?.credits_balance ?? 0}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Relatórios" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Mensal"
            value={`€${stats.totalMonthlyRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{
              value: Math.abs(Math.round(revenueGrowth)),
              isPositive: revenueGrowth >= 0,
            }}
            description="vs. mês anterior"
          />
          <StatCard
            title="Total Clientes"
            value={clientsWithStats.length}
            icon={Users}
            trend={{
              value: currentMonthClients,
              isPositive: true,
            }}
            description={`+${currentMonthClients} este mês`}
          />
          <StatCard
            title="Agentes Ativos"
            value={agents.filter((a) => a.status === "active").length}
            icon={Bot}
            description={`De ${agents.length} total`}
          />
          <StatCard
            title="Total Mensagens"
            value={agents.reduce((sum, a) => sum + a.messages_handled, 0).toLocaleString()}
            icon={TrendingUp}
            description="Processadas pelos agentes"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Receita Mensal
              </CardTitle>
              <CardDescription>Evolução da receita nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `€${value}`} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `€${value}`} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Client Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Crescimento de Clientes
              </CardTitle>
              <CardDescription>Novos clientes vs total acumulado</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={clientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="novos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Distribuição por Plano
              </CardTitle>
              <CardDescription>Clientes por tipo de plano</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Messages by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Mensagens por Tipo
              </CardTitle>
              <CardDescription>Volume de mensagens por tipo de agente</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={messagesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {messagesByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Clientes
              </CardTitle>
              <CardDescription>Por valor mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum cliente registado
                  </div>
                ) : (
                  topClients.map((client, index) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{client.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {client.agents} agentes • {client.websites} sites
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          €{client.revenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">/mês</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
