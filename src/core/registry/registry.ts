import type {
  ComponentCategory,
  ComponentDefinition,
  ComponentRegistry,
} from "./types";

class InMemoryRegistry implements ComponentRegistry {
  private defs = new Map<string, ComponentDefinition>();

  register(def: ComponentDefinition): void {
    this.defs.set(def.id, def);
  }
  get(id: string) {
    return this.defs.get(id);
  }
  getByType(category: ComponentCategory, type: string) {
    for (const d of this.defs.values()) {
      if (d.category === category && d.type === type) return d;
    }
    return undefined;
  }
  all() {
    return Array.from(this.defs.values());
  }
  byCategory(category: ComponentCategory) {
    return this.all().filter((d) => d.category === category);
  }
}

export const componentRegistry: ComponentRegistry = new InMemoryRegistry();
