import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "active" | "inactive" | "pending" | "error" | "draft";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-muted hover:bg-muted/80",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  draft: {
    label: "Draft",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
};

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", config.className, className)}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "active" && "bg-success",
            status === "inactive" && "bg-muted-foreground",
            status === "pending" && "bg-warning",
            status === "error" && "bg-destructive",
            status === "draft" && "bg-info"
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}
