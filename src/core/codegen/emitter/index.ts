export * from "./EmitterRegistry";
export * from "./fallbackEmitter";
export * from "./printJsxToString";
export * from "./sectionEmitters";
import { componentEmitterRegistry } from "./EmitterRegistry";
import { builtinSectionEmitters } from "./sectionEmitters";

let registered = false;
export function registerBuiltinEmitters(): void {
  if (registered) return;
  registered = true;
  for (const e of builtinSectionEmitters) componentEmitterRegistry.register(e);
}
