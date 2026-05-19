import { memo } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store/editorStore";

export const FloatingActions = memo(function FloatingActions() {
  const toggleAI = useEditorStore((s) => s.toggleAIPanel);
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button size="lg" className="rounded-full shadow-lg" onClick={() => toggleAI()}>
        <Sparkles className="h-4 w-4 mr-2" /> IA
      </Button>
    </div>
  );
});
