import { useCallback, useRef } from "react";

/**
 * Returns a stable callback whose identity never changes but always calls the
 * latest function passed in. Useful for memoized children that should never
 * re-render due to inline callback identity changes.
 */
export function useStableCallback<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: TArgs) => ref.current(...args), []);
}
