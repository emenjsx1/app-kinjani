import type { AIOperationEnvelope } from "../types";

export interface AIConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  /** Operations the assistant produced for this turn (if any). */
  operationIds?: string[];
}

export interface AIIntentRecord {
  id: string;
  prompt: string;
  detectedIntent?: string;
  agent?: string;
  createdAt: string;
}

export interface AIMemorySnapshot {
  conversation: AIConversationMessage[];
  intents: AIIntentRecord[];
  appliedOperations: AIOperationEnvelope[];
  rollbackRefs: Array<{ operationId: string; rollbackOperationId?: string }>;
}
