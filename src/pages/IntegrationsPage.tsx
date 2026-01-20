import { MessageSquare, Table2, FileSpreadsheet, Key } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { IntegrationCard } from "@/components/ui/integration-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const integrations = [
  {
    id: "whatsapp",
    title: "WhatsApp (Evolution API)",
    description: "Connect your WhatsApp Business account",
    icon: MessageSquare,
    status: "connected" as const,
  },
  {
    id: "sheets",
    title: "Google Sheets",
    description: "Export leads and data to spreadsheets",
    icon: FileSpreadsheet,
    status: "disconnected" as const,
  },
  {
    id: "ezpn",
    title: "EZPN",
    description: "Payment processing integration",
    icon: Table2,
    status: "disconnected" as const,
  },
  {
    id: "api",
    title: "API Keys",
    description: "Manage your API access tokens",
    icon: Key,
    status: "disconnected" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <AppLayout pageTitle="Integrations" credits={1250}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>
              Connect KINJA AI with your favorite tools and services
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
                  onConnect={() => console.log(`Connect ${integration.id}`)}
                  onDisconnect={() => console.log(`Disconnect ${integration.id}`)}
                  onConfigure={() => console.log(`Configure ${integration.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
