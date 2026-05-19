import type { AIOperationEnvelope } from "../types";
import type { AIConversationMessage, AIIntentRecord, AIMemorySnapshot } from "./types";

/**
 * Lightweight in-memory AI operational memory. Per-project, lives for the
 * editor session. Persisted memory (DB / vector) can plug in later behind
 * the same interface.
 */
export class AIMemoryStore {
  private conversation: AIConversationMessage[] = [];
  private intents: AIIntentRecord[] = [];
  private appliedOperations: AIOperationEnvelope[] = [];
  private rollbackRefs: Array<{ operationId: string; rollbackOperationId?: string }> = [];

  appendMessage(msg: AIConversationMessage) {
    this.conversation.push(msg);
    if (this.conversation.length > 200) this.conversation.shift();
  }

  recordIntent(intent: AIIntentRecord) {
    this.intents.push(intent);
    if (this.intents.length > 200) this.intents.shift();
  }

  recordOperations(envs: AIOperationEnvelope[]) {
    this.appliedOperations.push(...envs);
    if (this.appliedOperations.length > 500) {
      this.appliedOperations.splice(0, this.appliedOperations.length - 500);
    }
  }

  recordRollbackRef(operationId: string, rollbackOperationId?: string) {
    this.rollbackRefs.push({ operationId, rollbackOperationId });
  }

  recentOperations(limit = 20): AIOperationEnvelope[] {
    return this.appliedOperations.slice(-limit);
  }

  recentConversation(limit = 20): AIConversationMessage[] {
    return this.conversation.slice(-limit);
  }

  snapshot(): AIMemorySnapshot {
    return {
      conversation: [...this.conversation],
      intents: [...this.intents],
      appliedOperations: [...this.appliedOperations],
      rollbackRefs: [...this.rollbackRefs],
    };
  }

  clear() {
    this.conversation = [];
    this.intents = [];
    this.appliedOperations = [];
    this.rollbackRefs = [];
  }
}

/** Default singleton convenient for the current single-editor app. */
export const aiMemory = new AIMemoryStore();
