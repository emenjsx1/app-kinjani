import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { SoftwareTimeline } from "@/components/ai/SoftwareTimeline";
import { AgentActivityPanel } from "@/components/ai/AgentActivityPanel";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useProfile } from "@/hooks/useProfile";
import { useAgents } from "@/hooks/useAgents";
import { useWebsites } from "@/hooks/useWebsites";
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
import {
  Bot,
  Globe,
  Coins,
  TrendingUp,
  Sparkles,
  Zap,
  MessageSquare,
  Plus,
  Rocket,
  ShieldCheck,
  ZapOff,
} from "lucide-react";

const COLORS = ["#45fd94", "#5ddcb1", "#aacbc4", "#095344"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useProfile();
  const { agents, isLoading: agentsLoading } = useAgents();
  const { websites } = useWebsites();
  const { getUsageThisMonth, getUsageByCategory } = useCredits();

  const isLoading = profileLoading || agentsLoading;

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalMessages = agents.reduce((sum, a) => sum + a.messages_handled, 0);
  const totalSites = websites.length;
  const usageThisMonth = getUsageThisMonth();
  const usageByCategory = getUsageByCategory();

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

  return (
    <AppLayout pageTitle="Painel" credits={profile?.credits_balance || 0}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-8 pb-12"
      >
        {/* Hero Greeting Panel */}
        <motion.section 
          variants={staggerItem}
          className="bg-[radial-gradient(circle_at_20%_30%,rgba(69,253,148,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(11,70,62,0.2)_0%,transparent_50%)] bg-card/40 border border-forest/30 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 md:max-w-2xl space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-primary/20 text-primary font-bold text-[10px] px-3 py-1 rounded-full border border-primary/30 tracking-wider font-mono">
                SISTEMA ATIVO: KINJANI CORE
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-primary/80 font-bold font-mono tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                LATÊNCIA: 14ms
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
              Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Centro de Operações</span>
            </h1>
            
            <p className="text-sm lg:text-base text-pistachio/80 leading-relaxed max-w-xl">
              Os seus agentes inteligentes estão a processar tarefas com 98.4% de eficiência. O seu espaço de trabalho está pronto para a criação da sua próxima ideia.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                onClick={() => navigate("/websites")}
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-6 py-5 rounded-xl shadow-lg shadow-primary/20 gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Rocket className="h-4 w-4" /> Novo Projeto
              </Button>
              <Button 
                onClick={() => navigate("/agents")}
                variant="outline"
                className="border border-forest/50 text-primary font-bold px-6 py-5 rounded-xl bg-transparent hover:bg-forest/25 transition-all"
              >
                Gerir Agentes
              </Button>
            </div>
          </div>
          
          <div className="absolute right-0 top-0 h-full w-2/5 hidden md:block opacity-25 pointer-events-none">
            <img 
              alt="Holographic Neural Network" 
              className="h-full w-full object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpWyS4vcH4MJCIEwSqCoxBr9urDRJzj1gYXdagTyloOlRqLLEpw-ZkaCQnOXTVEMMo5fMQhNZtV9IDl6qDd9cUtVooZlK83fAIVaTvcnqGKTMa1EdaFo0RaPhQJTZq6N2AFOyer27ParLng5jTdL-JFEQ44-ghMhiR-EeM0gNl5uivitzM1qYv9ZmvYNu_-k3j2pTSjXNiAYvSvR_oXMJAFX827ByB6GC0i8Ee2i8gwd7Hmeu-es0l7BYCEmQjFEIPtMFgR4CIUshC"
            />
          </div>
        </motion.section>

        {/* Stats Summary Cards */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Credits remaining */}
          <div className="bg-card/45 border border-forest/20 p-5 rounded-xl hover:border-primary/40 transition-colors shadow-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">Créditos de Conta</p>
                <h3 className="text-2xl font-bold text-foreground font-mono mt-1 group-hover:text-primary transition-colors">
                  {profile?.credits_balance?.toLocaleString() || "0"}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-forest/20 text-primary border border-forest/30 shrink-0">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="text-[11px] text-primary font-bold flex items-center gap-1 font-mono">
              <span>{usageThisMonth} consumidos este mês</span>
            </div>
          </div>

          {/* Active Agents */}
          <div className="bg-card/45 border border-forest/20 p-5 rounded-xl hover:border-primary/40 transition-colors shadow-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">Agentes Operacionais</p>
                <h3 className="text-2xl font-bold text-foreground font-mono mt-1 group-hover:text-primary transition-colors">
                  {agents.length < 10 ? `0${agents.length}` : agents.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-forest/20 text-primary border border-forest/30 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            </div>
            <div className="text-[11px] text-primary font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>{activeAgents} ativos no momento</span>
            </div>
          </div>

          {/* Websites built */}
          <div className="bg-card/45 border border-forest/20 p-5 rounded-xl hover:border-primary/40 transition-colors shadow-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">Websites Gerados</p>
                <h3 className="text-2xl font-bold text-foreground font-mono mt-1 group-hover:text-primary transition-colors">
                  {totalSites < 10 ? `0${totalSites}` : totalSites}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-forest/20 text-primary border border-forest/30 shrink-0">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <div className="text-[11px] text-pistachio/60 font-semibold flex items-center gap-1">
              <span>Publicados na nuvem</span>
            </div>
          </div>

          {/* Handled messages */}
          <div className="bg-card/45 border border-forest/20 p-5 rounded-xl hover:border-primary/40 transition-colors shadow-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">Pedidos Processados</p>
                <h3 className="text-2xl font-bold text-foreground font-mono mt-1 group-hover:text-primary transition-colors">
                  {totalMessages.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-forest/20 text-primary border border-forest/30 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-[11px] text-[#f59e0b] font-bold flex items-center gap-1">
              <span>Latência média de resposta ~1.4s</span>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Trend Chart */}
          <Card className="bg-card/50 border-forest/30 shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Agentes Criados</CardTitle>
              <CardDescription className="text-xs text-pistachio/60">Tendência mensal de criação de instâncias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={getAgentTrendData()}>
                  <CartesianGrid stroke="rgba(9, 83, 68, 0.15)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#859586" fontSize={10} tickLine={false} />
                  <YAxis stroke="#859586" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#021f1b",
                      border: "1px solid rgba(9, 83, 68, 0.4)",
                      borderRadius: "8px",
                      color: "#cfe8e1",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="agents"
                    stroke="#45fd94"
                    strokeWidth={2}
                    dot={{ fill: "#45fd94", strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Volume Chart */}
          <Card className="bg-card/50 border-forest/30 shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Volume de Pedidos</CardTitle>
              <CardDescription className="text-xs text-pistachio/60">Total de interações de chat esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid stroke="rgba(9, 83, 68, 0.15)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#859586" fontSize={10} tickLine={false} />
                  <YAxis stroke="#859586" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#021f1b",
                      border: "1px solid rgba(9, 83, 68, 0.4)",
                      borderRadius: "8px",
                      color: "#cfe8e1",
                    }}
                  />
                  <Bar dataKey="messages" fill="#5ddcb1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Credit Allocation */}
          <Card className="bg-card/50 border-forest/30 shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Divisão de Custos</CardTitle>
              <CardDescription className="text-xs text-pistachio/60">Créditos consumidos por serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={usageByCategory.length > 0 ? usageByCategory : [{ name: 'Sem dados', value: 1 }]}
                    cx="50%"
                    cy="45%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(usageByCategory.length > 0 ? usageByCategory : [{ name: 'Sem dados', value: 1 }]).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#021f1b",
                      border: "1px solid rgba(9, 83, 68, 0.4)",
                      borderRadius: "8px",
                      color: "#cfe8e1",
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    wrapperStyle={{ fontSize: 9, color: "#cfe8e1" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Software Factory Pipeline */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-card/40 border border-forest/30 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2 font-mono">Fábrica de Software AI</h3>
            <p className="text-xs text-pistachio/60 mb-6">Pipeline estruturado para geração e promoção de código automatizado.</p>
            <SoftwareTimeline defaultIntent="CRM para empresas de logística" />
          </div>
          
          <div className="lg:col-span-4 bg-card/40 border border-forest/30 rounded-xl p-1 shadow-lg overflow-hidden flex flex-col">
            <AgentActivityPanel />
          </div>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
