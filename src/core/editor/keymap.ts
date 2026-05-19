export interface KeyBinding {
  id: string;
  description: string;
  /** Pattern like "mod+z", "shift+mod+z", "Escape", "ArrowUp". */
  pattern: string;
  scope?: "global" | "editor" | "canvas";
  preventDefault?: boolean;
  handler: (e: KeyboardEvent) => void;
}

class KeyBindingRegistry {
  private bindings = new Map<string, KeyBinding>();

  register(b: KeyBinding): void {
    this.bindings.set(b.id, b);
  }
  unregister(id: string): void {
    this.bindings.delete(id);
  }
  all(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }
}

export const keyBindingRegistry = new KeyBindingRegistry();
