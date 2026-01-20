import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  colorClass: string;
  hex?: string;
  cssVar: string;
  textLight?: boolean;
}

export function ColorSwatch({
  name,
  colorClass,
  hex,
  cssVar,
  textLight = false,
}: ColorSwatchProps) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "h-24 rounded-lg flex items-end p-3 shadow-sm border border-border/20",
          colorClass
        )}
      >
        <span
          className={cn(
            "text-sm font-medium",
            textLight ? "text-white" : "text-foreground"
          )}
        >
          {name}
        </span>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-xs font-mono text-muted-foreground">{cssVar}</p>
        {hex && <p className="text-xs font-mono text-muted-foreground">{hex}</p>}
      </div>
    </div>
  );
}
