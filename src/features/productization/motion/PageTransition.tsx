import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * Lightweight route-level transition wrapper. Uses CSS classes only —
 * no animation lib coupling, no jank, no layout-shift.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [stage, setStage] = useState<"enter" | "ready">("enter");

  useEffect(() => {
    setStage("enter");
    const id = requestAnimationFrame(() => setStage("ready"));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className={
        "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] " +
        (stage === "enter"
          ? "opacity-0 translate-y-1"
          : "opacity-100 translate-y-0")
      }
    >
      {children}
    </div>
  );
}
