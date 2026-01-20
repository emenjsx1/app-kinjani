import { Client } from "@/hooks/useClients";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Bot,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
} from "lucide-react";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewDetails: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onDelete, onViewDetails }: ClientCardProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  };

  const planLabels: Record<string, string> = {
    basic: "Básico",
    pro: "Profissional",
    enterprise: "Enterprise",
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo or Avatar */}
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: client.primary_color + "20" }}
            >
              {client.logo_url ? (
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2
                  className="h-6 w-6"
                  style={{ color: client.primary_color }}
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{client.name}</h3>
              {client.company && (
                <p className="text-sm text-muted-foreground">{client.company}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(client)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {client.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {client.phone}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{client.agents_count || 0}</span>
            <span className="text-muted-foreground">agentes</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{client.websites_count || 0}</span>
            <span className="text-muted-foreground">sites</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[client.status]}>
              {client.status === "active" ? "Ativo" : client.status === "pending" ? "Pendente" : "Inativo"}
            </Badge>
            <Badge variant="secondary">{planLabels[client.plan] || client.plan}</Badge>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground">
              €{Number(client.monthly_value || 0).toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/mês</span>
          </div>
        </div>

        {/* Color preview dots */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: client.primary_color }}
            title="Cor primária"
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: client.secondary_color }}
            title="Cor secundária"
          />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: client.accent_color }}
            title="Cor de destaque"
          />
        </div>
      </CardContent>
    </Card>
  );
}
