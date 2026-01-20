import { MessageSquare, Table2, FileSpreadsheet, Key } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { IntegrationCard } from "@/components/ui/integration-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const integrations = [
  {
    id: "whatsapp",
    title: "WhatsApp (Evolution API)",
    description: "Ligue a sua conta WhatsApp Business",
    icon: MessageSquare,
    status: "connected" as const,
  },
  {
    id: "sheets",
    title: "Google Sheets",
    description: "Exporte leads e dados para folhas de cálculo",
    icon: FileSpreadsheet,
    status: "disconnected" as const,
  },
  {
    id: "ezpn",
    title: "EZPN",
    description: "Integração de processamento de pagamentos",
    icon: Table2,
    status: "disconnected" as const,
  },
  {
    id: "api",
    title: "Chaves API",
    description: "Gerir os seus tokens de acesso à API",
    icon: Key,
    status: "disconnected" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <AppLayout pageTitle="Integrações" credits={1250}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Integrações Disponíveis</CardTitle>
            <CardDescription>
              Ligue o KINJA AI às suas ferramentas e serviços favoritos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  title={integration.title}
                  description={integration.description}
                  icon={integration.icon}
                  status={integration.status}
                  onConnect={() => console.log(`Ligar ${integration.id}`)}
                  onDisconnect={() => console.log(`Desligar ${integration.id}`)}
                  onConfigure={() => console.log(`Configurar ${integration.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
