/**
 * InteractionEngine — compiles InteractionBinding[] into runtime-ready
 * handlers and animation specs. Two outputs:
 *
 *   - `attach(node, bindings)` — returns React-style event handler props
 *   - `compile(bindings)`      — returns serializable spec consumed by codegen
 *
 * Animations use framer-motion's `animate()` API at runtime; codegen emits
 * `<motion.div animate={...} />` blocks deterministically.
 */

import type { InteractionBinding, InteractionEvent, InteractionStep } from "../types";

export interface AttachedHandlers {
  onClick?: (e: unknown) => void;
  onMouseEnter?: (e: unknown) => void;
  onMouseLeave?: (e: unknown) => void;
  onFocus?: (e: unknown) => void;
  onBlur?: (e: unknown) => void;
}

export interface CompiledInteraction {
  event: InteractionEvent;
  steps: InteractionStep[];
}

export interface InteractionRuntime {
  invoke(handlerRef: string, payload: Record<string, unknown>): void;
  animate(targetId: string, payload: Record<string, unknown>, opts: { duration?: number; easing?: string }): void;
  set(targetId: string, payload: Record<string, unknown>): void;
}

export class InteractionEngine {
  attach(bindings: InteractionBinding[], runtime: InteractionRuntime, selfId: string): AttachedHandlers {
    const handlers: AttachedHandlers = {};
    for (const b of bindings) {
      const run = () => this.run(b.timeline, runtime, selfId);
      switch (b.event) {
        case "click":
          handlers.onClick = run;
          break;
        case "hover":
          handlers.onMouseEnter = run;
          break;
        case "focus":
          handlers.onFocus = run;
          break;
        case "blur":
          handlers.onBlur = run;
          break;
        case "mount":
          // mount handled by component lifecycle in renderer; no-op here.
          break;
        // unmount / scroll-into-view handled by dedicated observers.
      }
    }
    return handlers;
  }

  private run(timeline: InteractionStep[], runtime: InteractionRuntime, selfId: string): void {
    for (const step of timeline) {
      const target = step.target ?? selfId;
      const delay = step.at ?? 0;
      const fire = () => {
        if (step.kind === "animate") {
          runtime.animate(target, step.payload, { duration: step.duration, easing: step.easing });
        } else if (step.kind === "set") {
          runtime.set(target, step.payload);
        } else if (step.kind === "invoke") {
          const ref = String(step.payload.ref ?? "");
          runtime.invoke(ref, step.payload);
        }
      };
      if (delay > 0) setTimeout(fire, delay);
      else fire();
    }
  }

  compile(bindings: InteractionBinding[]): CompiledInteraction[] {
    return bindings.map((b) => ({ event: b.event, steps: b.timeline }));
  }
}

export const interactionEngine = new InteractionEngine();
