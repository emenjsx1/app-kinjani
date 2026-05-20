import { useState } from "react";
import { browserRuntime } from "@/core/cloud";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

interface Line { kind: "in" | "out" | "err"; text: string }

export function LiveTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Kinjani Runtime v0.1 — browser sandbox ready" },
    { kind: "out", text: "Type any JS expression. Remote runtimes coming soon." },
  ]);
  const [cmd, setCmd] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!cmd.trim()) return;
    const input = cmd;
    setCmd("");
    setLines((l) => [...l, { kind: "in", text: `> ${input}` }]);
    setBusy(true);
    const { stdout, stderr, code } = await browserRuntime.exec(input);
    setLines((l) => [
      ...l,
      ...(stdout ? [{ kind: "out" as const, text: stdout }] : []),
      ...(stderr ? [{ kind: "err" as const, text: stderr }] : []),
      ...(code !== 0 && !stderr ? [{ kind: "err" as const, text: `exit ${code}` }] : []),
    ]);
    setBusy(false);
  };

  return (
    <Card className="p-4 border-border/60 bg-zinc-950 text-zinc-100">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <h3 className="font-semibold text-sm">Terminal ao Vivo</h3>
      </div>
      <div className="font-mono text-xs space-y-0.5 max-h-64 overflow-y-auto mb-3">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "in"
                ? "text-emerald-300"
                : l.kind === "err"
                ? "text-rose-400"
                : "text-zinc-300"
            }
          >
            <pre className="whitespace-pre-wrap break-all">{l.text}</pre>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="2 + 2 · fetch('/').then(r=>r.status) · ..."
          className="bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-xs"
          disabled={busy}
        />
        <Button size="sm" onClick={run} disabled={busy}>
          Executar
        </Button>
      </div>
    </Card>
  );
}
