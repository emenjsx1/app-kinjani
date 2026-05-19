import type { RuntimeEngine, RuntimeEngineId } from "./types";

type Factory = () => RuntimeEngine;

class RuntimeRegistryImpl {
  private factories = new Map<RuntimeEngineId, Factory>();
  private instances = new Map<RuntimeEngineId, RuntimeEngine>();

  register(id: RuntimeEngineId, factory: Factory): void {
    this.factories.set(id, factory);
  }

  /** Get a cached engine instance (lazy). */
  get(id: RuntimeEngineId): RuntimeEngine | undefined {
    if (this.instances.has(id)) return this.instances.get(id);
    const f = this.factories.get(id);
    if (!f) return undefined;
    const instance = f();
    this.instances.set(id, instance);
    return instance;
  }

  list(): RuntimeEngineId[] {
    return Array.from(this.factories.keys());
  }

  async dispose(id: RuntimeEngineId): Promise<void> {
    const e = this.instances.get(id);
    if (e) {
      await e.dispose();
      this.instances.delete(id);
    }
  }

  async disposeAll(): Promise<void> {
    for (const id of Array.from(this.instances.keys())) {
      await this.dispose(id);
    }
  }
}

export const runtimeRegistry = new RuntimeRegistryImpl();
