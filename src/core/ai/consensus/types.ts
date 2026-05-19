/**
 * Agent consensus / voting types (Phase 4.3)
 */

import type { AIOperationEnvelope } from "../types";

export interface AgentProposal {
  agent: string;
  confidence: number; // 0..1
  operations: AIOperationEnvelope[];
  reasoning: string;
  /** Optional self-reported weight (e.g. specialist boost). */
  weight?: number;
}

export interface ConsensusResult {
  winner: AgentProposal | null;
  merged: AIOperationEnvelope[];
  rejected: AgentProposal[];
  disagreementScore: number; // 0..1 (1 = high disagreement)
  reasoning: string;
}

export interface ConsensusPolicy {
  /** Minimum confidence to consider a proposal at all. */
  minConfidence: number;
  /** Allow merging compatible operations across agents. */
  allowMerge: boolean;
  /** Threshold below which all proposals are rejected. */
  rejectThreshold: number;
  /** Tie-breaking strategy. */
  tieBreaker: "highest-weight" | "fewest-ops" | "first-wins";
}

export const DEFAULT_CONSENSUS_POLICY: ConsensusPolicy = {
  minConfidence: 0.35,
  allowMerge: true,
  rejectThreshold: 0.2,
  tieBreaker: "highest-weight",
};
