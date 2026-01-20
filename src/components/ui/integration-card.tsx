import { ReactNode } from "react";
import { LucideIcon, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: "connected" | "disconnected";
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
  className?: string;
}

export function IntegrationCard({
  title,
  description,
  icon: Icon,
  status,
  onConnect,
  onDisconnect,
  onConfigure,
  className,
}: IntegrationCardProps) {
  const isConnected = status === "connected";

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-lg p-2.5",
              isConnected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
        <StatusBadge status={isConnected ? "active" : "inactive"} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex gap-2">
          {isConnected ? (
            <>
              {onConfigure && (
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  Configure
                </Button>
              )}
              {onDisconnect && (
                <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-destructive">
                  Disconnect
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" onClick={onConnect}>
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusIndicatorProps {
  status: "online" | "offline" | "error" | "pending";
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: "bg-success", text: "Online" },
    offline: { color: "bg-muted-foreground", text: "Offline" },
    error: { color: "bg-destructive", text: "Error" },
    pending: { color: "bg-warning", text: "Pending" },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", config.color)} />
      {label || config.text}
    </div>
  );
}
