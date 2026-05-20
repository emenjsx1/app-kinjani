/**
 * Live "Creative Session" view — shows energy, beats, rhythm and critique
 * as the AI authors an experience. Replaces the section-list mental model
 * with intention-first feedback.
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GenerativeResult } from "@/core/genesis";

interface Props {
  result: GenerativeResult | null;
  loading?: boolean;
}

export function CreativeSessionPanel({ result, loading }: Props) {
  if (loading && !result) {
    return (
      <Card className="p-6 space-y-3">
        <p className="text-sm text-muted-foreground">Sessão criativa em curso…</p>
        <Progress value={20} />
      </Card>
    );
  }
  if (!result) return null;

  const { intent, energy, plan, critique, iterations, dna } = result;

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
            Direção criativa
          </h3>
          <Badge variant="outline">{energy.label}</Badge>
        </div>
        <p className="text-sm">{energy.manifesto}</p>
        <p className="text-xs opacity-60">
          Intenção: {intent.goal} • público: {intent.audience} • domínio: {intent.domain}
        </p>
        <p className="text-xs opacity-50">DNA: {dna.signature.slice(0, 12)}…</p>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
          Batidas da composição
        </h3>
        <div className="space-y-2">
          {plan.beats.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3">
              <span className="text-xs opacity-50 w-6">{i + 1}</span>
              <Badge variant="secondary" className="capitalize">
                {b.kind.replace(/-/g, " ")}
              </Badge>
              <span className="text-xs opacity-60">{b.spatial}</span>
              <div className="flex-1 h-1 bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.round(b.emphasis * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {critique && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
              Auto-crítica
            </h3>
            <Badge variant={critique.passed ? "default" : "destructive"}>
              {critique.passed ? "aprovado" : "regenerar"} • {Math.round(critique.overall * 100)}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(critique.scores).map(([axis, score]) => (
              <div key={axis} className="flex items-center gap-2">
                <span className="capitalize opacity-60 w-28">{axis}</span>
                <div className="flex-1 h-1 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/60"
                    style={{ width: `${Math.round(score * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {critique.notes.length > 0 && (
            <ul className="text-xs opacity-70 list-disc list-inside space-y-1">
              {critique.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
          <p className="text-xs opacity-50">Iterações: {iterations}</p>
        </Card>
      )}
    </div>
  );
}
