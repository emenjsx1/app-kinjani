import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  used: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function UsageBar({
  used,
  total,
  label,
  showPercentage = true,
  className,
  variant,
}: UsageBarProps) {
  const percentage = Math.round((used / total) * 100);

  // Auto-determine variant based on usage
  const autoVariant =
    variant ||
    (percentage >= 90 ? "destructive" : percentage >= 70 ? "warning" : "default");

  const variantStyles = {
    default: "[&>div]:bg-primary",
    success: "[&>div]:bg-success",
    warning: "[&>div]:bg-warning",
    destructive: "[&>div]:bg-destructive",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium">
              {used.toLocaleString()} / {total.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <Progress value={percentage} className={cn("h-2", variantStyles[autoVariant])} />
    </div>
  );
}

interface UsageTableRow {
  id: string;
  date: string;
  action: string;
  credits: number;
}

interface UsageTableProps {
  data: UsageTableRow[];
  className?: string;
}

export function UsageTable({ data, className }: UsageTableProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Action
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Credits
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="px-4 py-3 text-sm">{row.date}</td>
              <td className="px-4 py-3 text-sm">{row.action}</td>
              <td
                className={cn(
                  "px-4 py-3 text-sm text-right font-medium",
                  row.credits < 0 ? "text-destructive" : "text-success"
                )}
              >
                {row.credits > 0 ? "+" : ""}
                {row.credits}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
