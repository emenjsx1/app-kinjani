interface SpacerWidgetProps {
  content: Record<string, string>;
}

export function SpacerWidget({ content }: SpacerWidgetProps) {
  const height = parseInt(content.height || "64");

  return <div style={{ height: `${height}px` }} />;
}
