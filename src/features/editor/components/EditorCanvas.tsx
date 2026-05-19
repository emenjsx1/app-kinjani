import { memo, type ReactNode } from "react";
import { useEditorStore } from "../store/editorStore";
import { cn } from "@/lib/utils";

const deviceWidths = { desktop: "100%", tablet: "768px", mobile: "390px" };

export const EditorCanvas = memo(function EditorCanvas({ children }: { children: ReactNode }) {
  const device = useEditorStore((s) => s.device);
  const zoom = useEditorStore((s) => s.zoom);
  return (
    <div className="flex items-start justify-center p-4">
      <div
        className={cn("origin-top transition-all bg-background shadow-lg rounded-lg overflow-hidden")}
        style={{
          width: deviceWidths[device],
          maxWidth: "100%",
          transform: `scale(${zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
});
