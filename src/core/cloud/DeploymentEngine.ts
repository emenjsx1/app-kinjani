/**
 * Phase H — Deployment Engine.
 *
 * Wraps the *real* publish flow: Kinjani projects are deployed through the
 * Lovable publish pipeline. This module orchestrates the lifecycle, persists
 * deployment records and emits execution events. It never fakes a "live" URL.
 *
 * For each call, it:
 *   1. Records the deployment as `queued`
 *   2. Transitions to `building` (visual feedback)
 *   3. Resolves to `live` ONLY when the caller provides a real URL,
 *      otherwise marks the deployment as `pending-publish` via `error`.
 */

import type { DeploymentRecord } from "./types";
import { executionBus } from "./ExecutionBus";

const STORAGE_KEY = "kinjani.deployments.v1";

function load(): DeploymentRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(list: DeploymentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-100)));
  } catch {
    /* quota */
  }
}

let seq = 0;
function id() {
  return `dep_${Date.now()}_${++seq}`;
}

export const DeploymentEngine = {
  list(): DeploymentRecord[] {
    return load().sort((a, b) => b.createdAt - a.createdAt);
  },

  async deploy(opts: {
    environment: DeploymentRecord["environment"];
    commit?: string;
    publishUrlResolver?: () => Promise<string | undefined>;
  }): Promise<DeploymentRecord> {
    const list = load();
    const rec: DeploymentRecord = {
      id: id(),
      environment: opts.environment,
      status: "queued",
      commit: opts.commit,
      createdAt: Date.now(),
    };
    list.push(rec);
    save(list);
    executionBus.publish({
      kind: "deploy.queued",
      level: "info",
      source: rec.id,
      message: `Queued ${opts.environment} deployment`,
    });

    // Building phase — pure status transition, no fake work.
    rec.status = "building";
    save(list);
    executionBus.publish({
      kind: "deploy.building",
      level: "info",
      source: rec.id,
      message: `Building ${opts.environment} bundle`,
    });

    try {
      const url = opts.publishUrlResolver ? await opts.publishUrlResolver() : undefined;
      if (url) {
        rec.status = "live";
        rec.url = url;
        rec.finishedAt = Date.now();
        rec.durationMs = rec.finishedAt - rec.createdAt;
        executionBus.publish({
          kind: "deploy.live",
          level: "info",
          source: rec.id,
          message: `Live at ${url}`,
          durationMs: rec.durationMs,
        });
      } else {
        rec.status = "failed";
        rec.error =
          "Publish URL not available. Click Publish in the editor to ship this build to production.";
        rec.finishedAt = Date.now();
        executionBus.publish({
          kind: "deploy.failed",
          level: "warn",
          source: rec.id,
          message: rec.error,
        });
      }
    } catch (err) {
      rec.status = "failed";
      rec.error = err instanceof Error ? err.message : String(err);
      rec.finishedAt = Date.now();
      executionBus.publish({
        kind: "deploy.failed",
        level: "error",
        source: rec.id,
        message: rec.error,
      });
    }
    save(list);
    return rec;
  },

  async rollback(deploymentId: string): Promise<DeploymentRecord | null> {
    const list = load();
    const target = list.find((d) => d.id === deploymentId);
    if (!target) return null;
    target.status = "rolled-back";
    save(list);
    executionBus.publish({
      kind: "deploy.rollback",
      level: "warn",
      source: deploymentId,
      message: `Rolled back ${target.environment}`,
    });
    return target;
  },
};
