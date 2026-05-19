import type { ComponentEmitter, ComponentEmitterRegistry } from "../types";
import { fallbackEmitter } from "./fallbackEmitter";

class InMemoryEmitterRegistry implements ComponentEmitterRegistry {
  private map = new Map<string, ComponentEmitter>();

  register(emitter: ComponentEmitter): void {
    this.map.set(emitter.componentId, emitter);
  }
  get(componentId: string): ComponentEmitter | undefined {
    return this.map.get(componentId);
  }
  fallback(): ComponentEmitter {
    return fallbackEmitter;
  }
  all(): ComponentEmitter[] {
    return Array.from(this.map.values());
  }
}

export const componentEmitterRegistry: ComponentEmitterRegistry =
  new InMemoryEmitterRegistry();
