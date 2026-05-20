import { create } from "zustand";

interface InsufficientCreditsState {
  open: boolean;
  required?: number;
  balance?: number;
  action?: string;
  show: (params: { required?: number; balance?: number; action?: string }) => void;
  hide: () => void;
}

export const useInsufficientCredits = create<InsufficientCreditsState>((set) => ({
  open: false,
  show: (params) => set({ open: true, ...params }),
  hide: () => set({ open: false }),
}));

/**
 * Centralised handler for edge-function errors related to credit charging.
 * Detects HTTP 402 (insufficient credits) and opens the global modal.
 * Returns true if it was a credit error (caller can stop further handling).
 */
export function handleCreditError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: number; context?: { status?: number; body?: unknown } } & Record<string, unknown>;
  const status =
    err.status ??
    err.context?.status ??
    (typeof (err as any).message === "string" && (err as any).message.match(/40[12]/) ? Number((err as any).message.match(/40[12]/)?.[0]) : undefined);

  if (status !== 402 && status !== 401) return false;

  let body: any = err.context?.body ?? (err as any).body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { /* noop */ }
  }

  useInsufficientCredits.getState().show({
    required: body?.required,
    balance: body?.balance,
    action: body?.action,
  });
  return true;
}
