import { Bot, Globe, Coins, TrendingUp, Sparkles, Zap, MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { SoftwareTimeline } from "@/components/ai/SoftwareTimeline";
import { AgentActivityPanel } from "@/components/ai/AgentActivityPanel";
import { staggerContainer, staggerItem } from "@/lib/motion";
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
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const quickActions = [
    { label: "Criar Agente", icon: Bot, onClick: () => navigate("/agents"), variant: "default" as const },
    { label: "Gerar Site", icon: Globe, onClick: () => navigate("/websites"), variant: "outline" as const },
    { label: "WhatsApp", icon: MessageSquare, onClick: () => navigate("/integrations"), variant: "outline" as const },
    { label: "Créditos", icon: Coins, onClick: () => navigate("/credits"), variant: "secondary" as const },
  ];

  return (
    <AppLayout pageTitle="Painel" credits={profile?.credits_balance || 0}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Hero greeting */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/60 glass elev-2 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-60 pointer-events-none" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Kinjani AI
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gradient-primary">
                Bem-vindo de volta
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeAgents > 0
                  ? `${activeAgents} ${activeAgents === 1 ? "agente ativo" : "agentes ativos"} a trabalhar agora.`
                  : "Crie o seu primeiro agente para começar."}
              </p>
            </div>
            <Button onClick={() => navigate("/websites")} className="hover-lift gap-2">
              <Zap className="h-4 w-4" /> Novo projeto
            </Button>
          </div>
        </motion.div>

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
        <motion.div variants={staggerItem} className="rounded-xl border border-border/60 glass elev-2 p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Ações Rápidas</h3>
            <p className="text-sm text-muted-foreground">Comece com tarefas comuns</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((a, i) => (
              <PremiumCard
                key={a.label}
                index={i}
                onClick={a.onClick}
                className="cursor-pointer group flex items-center gap-3"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </PremiumCard>
            ))}
          </div>
        </motion.div>

        {/* Fábrica de Software AI */}
        <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
          <SoftwareTimeline className="lg:col-span-2" defaultIntent="CRM para empresas de logística" />
          <AgentActivityPanel />
        </motion.div>
      </motion.div>

    </AppLayout>
  );
}
