import { Bot, Globe, Coins, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const lineData = [
  { name: "Jan", agents: 4 },
  { name: "Fev", agents: 6 },
  { name: "Mar", agents: 8 },
  { name: "Abr", agents: 12 },
  { name: "Mai", agents: 15 },
  { name: "Jun", agents: 18 },
];

const barData = [
  { name: "Seg", messages: 120 },
  { name: "Ter", messages: 180 },
  { name: "Qua", messages: 150 },
  { name: "Qui", messages: 220 },
  { name: "Sex", messages: 280 },
  { name: "Sáb", messages: 90 },
  { name: "Dom", messages: 60 },
];

const pieData = [
  { name: "Chat Agente", value: 400 },
  { name: "Geração Sites", value: 300 },
  { name: "Embeddings", value: 200 },
  { name: "Chamadas API", value: 100 },
];

const COLORS = ["hsl(152, 100%, 44%)", "hsl(162, 63%, 47%)", "hsl(160, 71%, 31%)", "hsl(166, 94%, 20%)"];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout pageTitle="Painel" credits={1250}>
      <div className="space-y-6">
        {/* Grid de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Agentes"
            value={18}
            icon={Bot}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
            description="desde o mês passado"
          />
          <StatCard
            title="Agentes Ativos"
            value={12}
            icon={Bot}
            variant="success"
            trend={{ value: 8, isPositive: true }}
            description="a funcionar agora"
          />
          <StatCard
            title="Total de Sites"
            value={7}
            icon={Globe}
            trend={{ value: 3, isPositive: true }}
            description="sites gerados"
          />
          <StatCard
            title="Créditos Restantes"
            value="1.250"
            icon={Coins}
            variant="warning"
            description="de 2.000 mensais"
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
                <LineChart data={lineData}>
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
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
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
              <Button variant="outline" onClick={() => navigate("/demo")}>Ver Demo</Button>
              <Button variant="secondary" onClick={() => navigate("/credits")}>Comprar Créditos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
