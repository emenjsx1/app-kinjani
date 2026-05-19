/**
 * Smart Retry Coordinator (Phase 4.7)
 *
 * Classifies pipeline failures and produces a deterministic next-attempt plan.
 * Hard cap on attempts + exponential or fixed backoff prevents loops.
 */

export type FailureClass =
  | "validation"
  | "conflict"
  | "permission"
  | "simulator"
  | "agent-empty"
  | "context-too-large"
  | "rate-limit"
  | "transient"
  | "unknown";

export interface RetryStrategy {
  maxRetries: number;
  backoffStrategy: "fixed" | "exponential";
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxRetries: 3,
  backoffStrategy: "exponential",
  baseDelayMs: 400,
  maxDelayMs: 4000,
};

export interface RetryDirective {
  shouldRetry: boolean;
  attempt: number;
  delayMs: number;
  /** Recommended adjustment to next attempt. */
  adjustment:
    | "reduce-context"
    | "fallback-agent"
    | "stricter-constraints"
    | "simplify-plan"
    | "none";
  fallbackAgent?: string;
  reason: string;
}

/**
 * Classify a failure into one of the FailureClass buckets.
 */
export function classifyFailure(error: unknown): FailureClass {
  const msg =
    (error instanceof Error ? error.message : String(error ?? "")) || "";
  const lower = msg.toLowerCase();
  if (lower.includes("validation") || lower.includes("schema")) return "validation";
  if (lower.includes("conflict")) return "conflict";
  if (lower.includes("permission") || lower.includes("forbidden"))
    return "permission";
  if (lower.includes("simulator") || lower.includes("dry-run"))
    return "simulator";
  if (lower.includes("empty") || lower.includes("no operations"))
    return "agent-empty";
  if (
    lower.includes("token") ||
    lower.includes("too large") ||
    lower.includes("context length")
  )
    return "context-too-large";
  if (lower.includes("429") || lower.includes("rate")) return "rate-limit";
  if (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("fetch")
  )
    return "transient";
  return "unknown";
}

export class AIRetryCoordinator {
  constructor(private strategy: RetryStrategy = DEFAULT_RETRY_STRATEGY) {}

  /**
   * Compute the next-attempt directive.
   * `attempt` is the *current* attempt number (1-based).
   */
  next(
    error: unknown,
    attempt: number,
    options?: { agent?: string; fallbackAgent?: string },
  ): RetryDirective {
    const cls = classifyFailure(error);
    const reason = `Falha classificada como ${cls}.`;

    if (attempt >= this.strategy.maxRetries) {
      return {
        shouldRetry: false,
        attempt,
        delayMs: 0,
        adjustment: "none",
        reason: `${reason} Limite de tentativas atingido.`,
      };
    }

    const delayMs = this.computeDelay(attempt);

    switch (cls) {
      case "context-too-large":
        return {
          shouldRetry: true,
          attempt: attempt + 1,
          delayMs,
          adjustment: "reduce-context",
          reason: `${reason} A reduzir o contexto.`,
        };
      case "validation":
      case "conflict":
        return {
          shouldRetry: true,
          attempt: attempt + 1,
          delayMs,
          adjustment: "stricter-constraints",
          reason: `${reason} A reforçar restrições.`,
        };
      case "agent-empty":
        return {
          shouldRetry: true,
          attempt: attempt + 1,
          delayMs,
          adjustment: "fallback-agent",
          fallbackAgent: options?.fallbackAgent,
          reason: `${reason} A trocar para agente alternativo.`,
        };
      case "simulator":
        return {
          shouldRetry: true,
          attempt: attempt + 1,
          delayMs,
          adjustment: "simplify-plan",
          reason: `${reason} A simplificar o plano.`,
        };
      case "permission":
        return {
          shouldRetry: false,
          attempt,
          delayMs: 0,
          adjustment: "none",
          reason: `${reason} Permissão negada — não é seguro repetir.`,
        };
      case "rate-limit":
      case "transient":
        return {
          shouldRetry: true,
          attempt: attempt + 1,
          delayMs: Math.max(delayMs, 1000),
          adjustment: "none",
          reason: `${reason} A repetir após backoff.`,
        };
      case "unknown":
      default:
        return {
          shouldRetry: attempt + 1 < this.strategy.maxRetries,
          attempt: attempt + 1,
          delayMs,
          adjustment: "none",
          reason: `${reason} Tentativa adicional cautelosa.`,
        };
    }
  }

  private computeDelay(attempt: number): number {
    if (this.strategy.backoffStrategy === "fixed") {
      return Math.min(this.strategy.maxDelayMs, this.strategy.baseDelayMs);
    }
    const exp = this.strategy.baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
    return Math.min(this.strategy.maxDelayMs, exp);
  }
}

export const defaultRetryCoordinator = new AIRetryCoordinator();
