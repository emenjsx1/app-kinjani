import { useState } from "react";
import { Plus, Search, MoreHorizontal, Bot, MessageSquare, Globe } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Sales Assistant",
    type: "Customer Support",
    status: "active",
    channel: "whatsapp",
    messagesHandled: 1250,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "FAQ Bot",
    type: "Knowledge Base",
    status: "active",
    channel: "embed",
    messagesHandled: 890,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Lead Qualifier",
    type: "Lead Generation",
    status: "inactive",
    channel: "both",
    messagesHandled: 450,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Onboarding Guide",
    type: "Customer Success",
    status: "pending",
    channel: "embed",
    messagesHandled: 0,
    createdAt: "2024-02-10",
  },
];

export default function AgentsPage() {
  const [agents] = useState<Agent[]>(mockAgents);
  const [search, setSearch] = useState("");

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const getChannelBadge = (channel: Agent["channel"]) => {
    const config = {
      whatsapp: { label: "WhatsApp", className: "bg-green-500/10 text-green-600" },
      embed: { label: "Embed", className: "bg-blue-500/10 text-blue-600" },
      both: { label: "Both", className: "bg-purple-500/10 text-purple-600" },
    };
    const { label, className } = config[channel];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  return (
    <AppLayout pageTitle="Agents" credits={1250}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Agents</CardTitle>
            <CardDescription>
              Manage and monitor all your AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No agents found"
                description="Create your first AI agent to get started"
                action={{
                  label: "Create Agent",
                  onClick: () => console.log("Create agent"),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {agent.type}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={agent.status} />
                      </TableCell>
                      <TableCell>{getChannelBadge(agent.channel)}</TableCell>
                      <TableCell className="text-right">
                        {agent.messagesHandled.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Test Agent</DropdownMenuItem>
                            <DropdownMenuItem>Copy Embed Code</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
