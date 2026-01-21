import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { Bot, Search, Link2 } from "lucide-react";
import { Agent } from "@/hooks/useAgents";

interface LinkAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAgents: Agent[];
  onLink: (agentId: string) => void;
}

export function LinkAgentDialog({
  open,
  onOpenChange,
  availableAgents,
  onLink,
}: LinkAgentDialogProps) {
  const [search, setSearch] = useState("");
  const [isLinking, setIsLinking] = useState<string | null>(null);

  const filteredAgents = availableAgents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLink = async (agentId: string) => {
    setIsLinking(agentId);
    await onLink(agentId);
    setIsLinking(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vincular Agente</DialogTitle>
          <DialogDescription>
            Selecione um agente disponível para vincular a este cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar agentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredAgents.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Nenhum agente disponível"
              description={
                search
                  ? "Nenhum agente corresponde à pesquisa"
                  : "Todos os agentes já estão vinculados a clientes"
              }
            />
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.type} • {agent.channel}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleLink(agent.id)}
                        disabled={isLinking === agent.id}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        {isLinking === agent.id ? "Vinculando..." : "Vincular"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
