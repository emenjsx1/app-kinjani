interface DividerWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export function DividerWidget({ content, primaryColor, spacing }: DividerWidgetProps) {
  const style = content.style || "line";
  const width = parseInt(content.width || "50");

  return (
    <section 
      className="px-6"
      style={{
        paddingTop: `${spacing?.paddingTop || 32}px`,
        paddingBottom: `${spacing?.paddingBottom || 32}px`,
      }}
    >
      <div className="max-w-5xl mx-auto flex justify-center">
        {style === "line" && (
          <div 
            className="h-[2px] rounded-full"
            style={{ 
              width: `${width}%`,
              backgroundColor: content.color === "primary" ? primaryColor : "#e5e7eb"
            }}
          />
        )}
        {style === "dots" && (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            ))}
          </div>
        )}
        {style === "wave" && (
          <svg 
            viewBox="0 0 200 10" 
            className="h-3" 
            style={{ width: `${width}%` }}
          >
            <path 
              d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5" 
              fill="none" 
              stroke={primaryColor}
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    </section>
  );
}
