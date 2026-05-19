import { memo, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/core/projects/types";
import { useEditorAI } from "../hooks/useEditorAI";

export const AIChatPanel = memo(function AIChatPanel({ project }: { project: Project | null }) {
  const { sendPrompt, loading } = useEditorAI(project);
  const [prompt, setPrompt] = useState("");

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold uppercase">Assistente IA</h3>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Descreve a alteração que pretendes..."
        rows={4}
        className="text-xs"
      />
      <Button
        size="sm"
        className="w-full"
        disabled={loading || !prompt.trim()}
        onClick={async () => {
          await sendPrompt(prompt);
          setPrompt("");
        }}
      >
        <Send className="h-3.5 w-3.5 mr-2" />
        {loading ? "A processar..." : "Enviar"}
      </Button>
    </div>
  );
});
