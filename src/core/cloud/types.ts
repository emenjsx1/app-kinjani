/**
 * Phase H — Cloud Execution Platform
 *
 * Type contracts for the InfraGraph, runtime adapters, deployment lifecycle,
 * observability and execution timeline. This is the source of truth for
 * "real software execution" inside Kinjani.
 *
 * Honest design principle: every type here reflects a REAL capability that
 * either runs locally in the browser, executes against the connected Supabase
 * backend, or is explicitly marked as `provisioning` / `unavailable` until
 * cloud infrastructure is wired. We never fake state.
 */

import type { FullstackGraph } from "@/core/ai/fullstack-os/types";

// ───────────────────────────────────────────────────────────────────────────────
// Runtime
// ───────────────────────────────────────────────────────────────────────────────

export type RuntimeKind = "browser" | "remote-node" | "cloud-container";

export type RuntimeStatus =
  | "idle"
  | "booting"
  | "ready"
  | "executing"
  | "error"
  | "unavailable";

export interface RuntimeCapabilities {
  filesystem: boolean;
  packageInstall: boolean;
  network: boolean;
  serverProcess: boolean;
  persistence: boolean;
}

export interface RuntimeHandle {
  id: string;
  kind: RuntimeKind;
  status: RuntimeStatus;
  capabilities: RuntimeCapabilities;
  startedAt?: number;
  detail?: string;
}

export interface RuntimeAdapter {
  kind: RuntimeKind;
  describe(): RuntimeCapabilities;
  boot(): Promise<RuntimeHandle>;
  exec(cmd: string, args?: string[]): Promise<{ stdout: string; stderr: string; code: number }>;
  install(pkg: string): Promise<{ ok: boolean; log: string }>;
  shutdown(): Promise<void>;
}

// ───────────────────────────────────────────────────────────────────────────────
// Infrastructure Graph (extends FullstackGraph)
// ───────────────────────────────────────────────────────────────────────────────

export type ServiceKind =
  | "edge-function"
  | "database"
  | "auth"
  | "storage"
  | "realtime"
  | "scheduler"
  | "webhook";

export type ServiceStatus = "live" | "deploying" | "degraded" | "down" | "not-provisioned";

export interface InfraService {
  id: string;
  kind: ServiceKind;
  name: string;
  status: ServiceStatus;
  endpoint?: string;
  region?: string;
  lastDeployedAt?: number;
  metadata?: Record<string, unknown>;
}

export interface DeploymentRecord {
  id: string;
  environment: "preview" | "staging" | "production";
  status: "queued" | "building" | "deploying" | "live" | "failed" | "rolled-back";
  commit?: string;
  url?: string;
  createdAt: number;
  finishedAt?: number;
  durationMs?: number;
  logsRef?: string;
  error?: string;
}

export interface EnvironmentProfile {
  id: string;
  name: string;
  kind: "preview" | "staging" | "production";
  vars: Record<string, string>;
  secrets: string[];           // names only — values live in Supabase secrets
  active: boolean;
}

export interface InfraGraph {
  fullstack: FullstackGraph;
  services: InfraService[];
  deployments: DeploymentRecord[];
  environments: EnvironmentProfile[];
  generatedAt: number;
}

// ───────────────────────────────────────────────────────────────────────────────
// Execution Events & Observability
// ───────────────────────────────────────────────────────────────────────────────

export type ExecutionEventKind =
  | "runtime.boot"
  | "runtime.exec"
  | "runtime.install"
  | "runtime.shutdown"
  | "deploy.queued"
  | "deploy.building"
  | "deploy.live"
  | "deploy.failed"
  | "deploy.rollback"
  | "migration.applied"
  | "migration.failed"
  | "auth.signup"
  | "auth.login"
  | "auth.session"
  | "api.request"
  | "api.response"
  | "workflow.trigger"
  | "workflow.step"
  | "workflow.complete"
  | "realtime.subscribe"
  | "realtime.update"
  | "scale.event"
  | "log"
  | "trace";

export type ExecutionLevel = "debug" | "info" | "warn" | "error";

export interface ExecutionEvent {
  id: string;
  ts: number;
  kind: ExecutionEventKind;
  level: ExecutionLevel;
  source: string;             // service id / agent id
  message: string;
  data?: Record<string, unknown>;
  durationMs?: number;
}

// ───────────────────────────────────────────────────────────────────────────────
// DevOps Agent
// ───────────────────────────────────────────────────────────────────────────────

export interface DevOpsPlanStep {
  id: string;
  title: string;
  kind: "deploy" | "migrate" | "configure" | "rollback" | "monitor";
  targets: string[];
  estDurationMs?: number;
}

export interface DevOpsPlan {
  goal: string;
  steps: DevOpsPlanStep[];
  createdAt: number;
}

// ───────────────────────────────────────────────────────────────────────────────
// Safety
// ───────────────────────────────────────────────────────────────────────────────

export interface ExecutionQuota {
  maxConcurrentRuntimes: number;
  maxExecMsPerHour: number;
  maxInstallSizeMB: number;
  blockedPackages: string[];
}

export const DEFAULT_QUOTA: ExecutionQuota = {
  maxConcurrentRuntimes: 2,
  maxExecMsPerHour: 5 * 60_000,
  maxInstallSizeMB: 100,
  blockedPackages: ["child_process", "fs-extra-native"],
};
