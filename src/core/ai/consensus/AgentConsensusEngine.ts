/**
 * AgentConsensusEngine (Phase 4.3)
 *
 * Deterministic voting / merging across multiple agent proposals.
 *
 * Algorithm:
 *  1. Drop proposals below `minConfidence`.
 *  2. If none remain, return reject.
 *  3. Score each proposal: confidence * (weight ?? 1).
 *  4. Detect conflicts by target signature (op-kind + target id).
 *  5. If `allowMerge` and proposals don't conflict, merge non-overlapping ops.
 *  6. Else pick winner by score, then tie-breaker.
 *  7. Compute disagreement as 1 - (winnerScore / sum(scores)).
 */

import type { AIOperationEnvelope } from "../types";
import {
  type AgentProposal,
  type ConsensusPolicy,
  type ConsensusResult,
  DEFAULT_CONSENSUS_POLICY,
} from "./types";

function opSignature(env: AIOperationEnvelope): string {
  const op = env.operation as Record<string, unknown>;
  const kind = String(op.op ?? "unknown");
  const target =
    (op.sectionId as string | undefined) ??
    (op.id as string | undefined) ??
    (op.targetId as string | undefined) ??
    "*";
  return `${kind}:${target}`;
}

function scoreProposal(p: AgentProposal): number {
  return p.confidence * (p.weight ?? 1);
}

export class AgentConsensusEngine {
  constructor(private policy: ConsensusPolicy = DEFAULT_CONSENSUS_POLICY) {}

  decide(proposals: AgentProposal[]): ConsensusResult {
    const eligible = proposals.filter(
      (p) => p.confidence >= this.policy.minConfidence,
    );
    const rejected = proposals.filter((p) => !eligible.includes(p));

    if (eligible.length === 0) {
      return {
        winner: null,
        merged: [],
        rejected,
        disagreementScore: 1,
        reasoning: "Nenhuma proposta atingiu a confiança mínima.",
      };
    }

    const ranked = [...eligible].sort((a, b) => scoreProposal(b) - scoreProposal(a));
    const top = ranked[0];

    if (scoreProposal(top) < this.policy.rejectThreshold) {
      return {
        winner: null,
        merged: [],
        rejected: proposals,
        disagreementScore: 1,
        reasoning: "Pontuação combinada abaixo do limiar de aceitação.",
      };
    }

    // Conflict matrix by signature
    const sigOwner = new Map<string, AgentProposal>();
    const conflicts: AgentProposal[] = [];
    for (const p of ranked) {
      let conflicts_p = false;
      for (const env of p.operations) {
        const sig = opSignature(env);
        const owner = sigOwner.get(sig);
        if (owner && owner !== p) {
          conflicts_p = true;
          break;
        }
      }
      if (conflicts_p) {
        conflicts.push(p);
      } else {
        for (const env of p.operations) sigOwner.set(opSignature(env), p);
      }
    }

    const totalScore = ranked.reduce((s, p) => s + scoreProposal(p), 0);
    const disagreementScore =
      totalScore <= 0 ? 1 : 1 - scoreProposal(top) / totalScore;

    if (this.policy.allowMerge && conflicts.length === 0 && ranked.length > 1) {
      const merged: AIOperationEnvelope[] = [];
      const seen = new Set<string>();
      for (const p of ranked) {
        for (const env of p.operations) {
          const sig = opSignature(env);
          if (seen.has(sig)) continue;
          seen.add(sig);
          merged.push(env);
        }
      }
      return {
        winner: top,
        merged,
        rejected: [...rejected, ...conflicts],
        disagreementScore,
        reasoning: `Fusão de ${ranked.length} agentes sem conflitos.`,
      };
    }

    // Tie-break
    const winner = this.breakTies(ranked.filter((p) => !conflicts.includes(p)) || ranked);
    return {
      winner,
      merged: winner ? winner.operations : [],
      rejected: [
        ...rejected,
        ...conflicts,
        ...ranked.filter((p) => p !== winner),
      ],
      disagreementScore,
      reasoning: winner
        ? `Vencedor por pontuação (${scoreProposal(winner).toFixed(2)}).`
        : "Sem vencedor claro.",
    };
  }

  private breakTies(candidates: AgentProposal[]): AgentProposal | null {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    const topScore = scoreProposal(candidates[0]);
    const tied = candidates.filter(
      (p) => Math.abs(scoreProposal(p) - topScore) < 1e-6,
    );
    if (tied.length === 1) return tied[0];
    switch (this.policy.tieBreaker) {
      case "fewest-ops":
        return [...tied].sort(
          (a, b) => a.operations.length - b.operations.length,
        )[0];
      case "first-wins":
        return tied[0];
      case "highest-weight":
      default:
        return [...tied].sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))[0];
    }
  }
}

export const defaultConsensusEngine = new AgentConsensusEngine();
