import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CreditsBadgeProps {
  credits: number;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "compact";
}

export function CreditsBadge({
  credits,
  className,
  showIcon = true,
  variant = "default",
}: CreditsBadgeProps) {
  const formattedCredits = credits.toLocaleString();
  
  const isLow = credits < 100;
  const isMedium = credits >= 100 && credits < 500;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5 px-3 py-1.5 font-medium",
        isLow && "bg-destructive/10 text-destructive border-destructive/20",
        isMedium && "bg-warning/10 text-warning border-warning/20",
        !isLow && !isMedium && "bg-primary/10 text-primary border-primary/20",
        variant === "compact" && "px-2 py-1 text-xs",
        className
      )}
    >
      {showIcon && <Coins className={cn("h-4 w-4", variant === "compact" && "h-3 w-3")} />}
      <span>{formattedCredits}</span>
      {variant === "default" && <span className="text-muted-foreground">credits</span>}
    </Badge>
  );
}
