import { Bot, Globe, Coins, TrendingUp } from "lucide-react";
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
  { name: "Feb", agents: 6 },
  { name: "Mar", agents: 8 },
  { name: "Apr", agents: 12 },
  { name: "May", agents: 15 },
  { name: "Jun", agents: 18 },
];

const barData = [
  { name: "Mon", messages: 120 },
  { name: "Tue", messages: 180 },
  { name: "Wed", messages: 150 },
  { name: "Thu", messages: 220 },
  { name: "Fri", messages: 280 },
  { name: "Sat", messages: 90 },
  { name: "Sun", messages: 60 },
];

const pieData = [
  { name: "Agent Chat", value: 400 },
  { name: "Website Gen", value: 300 },
  { name: "Embeddings", value: 200 },
  { name: "API Calls", value: 100 },
];

const COLORS = ["hsl(152, 100%, 44%)", "hsl(162, 63%, 47%)", "hsl(160, 71%, 31%)", "hsl(166, 94%, 20%)"];

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Dashboard" credits={1250}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Agents"
            value={18}
            icon={Bot}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
            description="from last month"
          />
          <StatCard
            title="Active Agents"
            value={12}
            icon={Bot}
            variant="success"
            trend={{ value: 8, isPositive: true }}
            description="currently running"
          />
          <StatCard
            title="Total Sites"
            value={7}
            icon={Globe}
            trend={{ value: 3, isPositive: true }}
            description="websites generated"
          />
          <StatCard
            title="Credits Left"
            value="1,250"
            icon={Coins}
            variant="warning"
            description="of 2,000 monthly"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Agents Created Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agents Created</CardTitle>
              <CardDescription>Monthly agent creation trend</CardDescription>
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

          {/* Messages Handled Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages Handled</CardTitle>
              <CardDescription>This week's message volume</CardDescription>
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

          {/* Credit Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Credit Usage</CardTitle>
              <CardDescription>Usage by feature</CardDescription>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>Create New Agent</Button>
              <Button variant="outline">Generate Website</Button>
              <Button variant="outline">View Demo</Button>
              <Button variant="secondary">Buy Credits</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
