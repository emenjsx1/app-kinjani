import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingScreen } from "../shell";

/**
 * Performance polish helpers.
 *
 *  - lazyRoute: wraps React.lazy with a unified suspense fallback.
 *  - useOptimistic: simple optimistic update helper with rollback on
 *    failure.
 *  - runtimeCache: in-memory request memoization with TTL.
 */

/* -------------------------------------------------------------------------- */
/*  Lazy route                                                                */
/* -------------------------------------------------------------------------- */

export function lazyRoute<T extends ComponentType<Record<string, unknown>>>(
  loader: () => Promise<{ default: T }>,
  fallback?: ReactElement,
): ComponentType<Record<string, unknown>> {
  const Lazy = lazy(loader);
  const Wrapped: ComponentType<Record<string, unknown>> = (props) => (
    <Suspense fallback={fallback ?? <LoadingScreen />}>
      <Lazy {...props} />
    </Suspense>
  );
  Wrapped.displayName = "LazyRoute";
  return Wrapped;
}

/* -------------------------------------------------------------------------- */
/*  Optimistic updates                                                        */
/* -------------------------------------------------------------------------- */

export interface OptimisticState<T> {
  value: T;
  pending: boolean;
  error: Error | null;
}

export function useOptimistic<T>(
  initial: T,
): [
  OptimisticState<T>,
  (next: T, commit: () => Promise<T>) => Promise<void>,
] {
  const [state, setState] = useState<OptimisticState<T>>({ value: initial, pending: false, error: null });
  const last = useRef(initial);

  const mutate = useCallback(async (next: T, commit: () => Promise<T>) => {
    const prev = last.current;
    last.current = next;
    setState({ value: next, pending: true, error: null });
    try {
      const result = await commit();
      last.current = result;
      setState({ value: result, pending: false, error: null });
    } catch (err) {
      last.current = prev;
      setState({ value: prev, pending: false, error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, []);

  return [state, mutate];
}

/* -------------------------------------------------------------------------- */
/*  Runtime cache                                                             */
/* -------------------------------------------------------------------------- */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class RuntimeCache {
  private map = new Map<string, CacheEntry<unknown>>();

  /** Get cached value (synchronous) or undefined. */
  get<T>(key: string): T | undefined {
    const entry = this.map.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs = 30_000): void {
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Memoize an async producer for `ttlMs`. */
  async wrap<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    this.set(key, value, ttlMs);
    return value;
  }

  invalidate(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

export const runtimeCache = new RuntimeCache();

/** React hook flavor over `runtimeCache.wrap`. */
export function useCachedAsync<T>(
  key: string,
  producer: () => Promise<T>,
  ttlMs = 30_000,
): { data: T | undefined; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(() => runtimeCache.get<T>(key));
  const [loading, setLoading] = useState(data === undefined);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const v = await runtimeCache.wrap(key, ttlMs, producer);
      setData(v);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [key, ttlMs, producer]);

  useEffect(() => {
    if (data === undefined) void run();
  }, [data, run]);

  return { data, loading, error, refetch: () => { runtimeCache.invalidate(key); void run(); } };
}
