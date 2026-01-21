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
import { Globe, Search, Link2 } from "lucide-react";
import { Website } from "@/hooks/useWebsites";

interface LinkWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableWebsites: Website[];
  onLink: (websiteId: string) => void;
}

export function LinkWebsiteDialog({
  open,
  onOpenChange,
  availableWebsites,
  onLink,
}: LinkWebsiteDialogProps) {
  const [search, setSearch] = useState("");
  const [isLinking, setIsLinking] = useState<string | null>(null);

  const filteredWebsites = availableWebsites.filter((website) =>
    website.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLink = async (websiteId: string) => {
    setIsLinking(websiteId);
    await onLink(websiteId);
    setIsLinking(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vincular Website</DialogTitle>
          <DialogDescription>
            Selecione um website disponível para vincular a este cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredWebsites.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="Nenhum website disponível"
              description={
                search
                  ? "Nenhum website corresponde à pesquisa"
                  : "Todos os websites já estão vinculados a clientes"
              }
            />
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredWebsites.map((website) => (
                  <div
                    key={website.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{website.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {website.template || "Personalizado"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={website.status === "active" ? "default" : "secondary"}>
                        {website.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleLink(website.id)}
                        disabled={isLinking === website.id}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        {isLinking === website.id ? "Vinculando..." : "Vincular"}
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
