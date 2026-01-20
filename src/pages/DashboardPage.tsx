import { Bot, Globe, Coins, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAgents } from "@/hooks/useAgents";
import { useCredits } from "@/hooks/useCredits";
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
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["hsl(152, 100%, 44%)", "hsl(162, 63%, 47%)", "hsl(160, 71%, 31%)", "hsl(166, 94%, 20%)"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useProfile();
  const { agents, isLoading: agentsLoading } = useAgents();
  const { getUsageThisMonth, getUsageByCategory } = useCredits();

  const isLoading = profileLoading || agentsLoading;

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalMessages = agents.reduce((sum, a) => sum + a.messages_handled, 0);
  const usageThisMonth = getUsageThisMonth();
  const usageByCategory = getUsageByCategory();

  // Generate chart data from real agents
  const getAgentTrendData = () => {
    const months: Record<string, number> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    agents.forEach(agent => {
      const date = new Date(agent.created_at);
      const monthKey = monthNames[date.getMonth()];
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return monthNames.slice(0, 6).map(name => ({
      name,
      agents: months[name] || 0,
    }));
  };

  // Generate messages data (mock for now, could be real with message tracking)
  const barData = [
    { name: "Seg", messages: Math.floor(totalMessages * 0.15) },
    { name: "Ter", messages: Math.floor(totalMessages * 0.18) },
    { name: "Qua", messages: Math.floor(totalMessages * 0.12) },
    { name: "Qui", messages: Math.floor(totalMessages * 0.20) },
    { name: "Sex", messages: Math.floor(totalMessages * 0.22) },
    { name: "Sáb", messages: Math.floor(totalMessages * 0.08) },
    { name: "Dom", messages: Math.floor(totalMessages * 0.05) },
  ];

  if (isLoading) {
    return (
      <AppLayout pageTitle="Painel" credits={0}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Painel" credits={profile?.credits_balance || 0}>
      <div className="space-y-6">
        {/* Grid de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Agentes"
            value={agents.length}
            icon={Bot}
            variant="primary"
            description="agentes criados"
          />
          <StatCard
            title="Agentes Ativos"
            value={activeAgents}
            icon={Bot}
            variant="success"
            description="a funcionar agora"
          />
          <StatCard
            title="Mensagens Totais"
            value={totalMessages.toLocaleString()}
            icon={TrendingUp}
            description="mensagens processadas"
          />
          <StatCard
            title="Créditos Restantes"
            value={profile?.credits_balance?.toLocaleString() || "0"}
            icon={Coins}
            variant="warning"
            description={`${usageThisMonth} usados este mês`}
          />
        </div>

        {/* Linha de Gráficos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfico de Agentes Criados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agentes Criados</CardTitle>
              <CardDescription>Tendência mensal de criação de agentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getAgentTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="agents"
                    stroke="hsl(152, 100%, 44%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(152, 100%, 44%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Mensagens Processadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensagens Processadas</CardTitle>
              <CardDescription>Volume de mensagens esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="messages" fill="hsl(162, 63%, 47%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Uso de Créditos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uso de Créditos</CardTitle>
              <CardDescription>Uso por funcionalidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={usageByCategory.length > 0 ? usageByCategory : [{ name: 'Sem dados', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(usageByCategory.length > 0 ? usageByCategory : [{ name: 'Sem dados', value: 1 }]).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Comece com tarefas comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/agents")}>Criar Novo Agente</Button>
              <Button variant="outline" onClick={() => navigate("/websites")}>Gerar Site</Button>
              <Button variant="outline" onClick={() => navigate("/integrations")}>Configurar WhatsApp</Button>
              <Button variant="secondary" onClick={() => navigate("/credits")}>Comprar Créditos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
