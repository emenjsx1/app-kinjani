/**
 * Phase H — InfraGraph builder.
 * Combines a FullstackGraph (from Phase G) with live runtime state
 * (deployments, environments, real Supabase services).
 */

import type { FullstackGraph } from "@/core/ai/fullstack-os/types";
import type { InfraGraph, InfraService } from "./types";
import { DeploymentEngine } from "./DeploymentEngine";
import { EnvironmentManager } from "./EnvironmentManager";

function deriveServices(graph: FullstackGraph): InfraService[] {
  const services: InfraService[] = [];
  let i = 0;
  const next = () => `svc_${Date.now()}_${++i}`;

  if (graph.data.tables.length) {
    services.push({
      id: next(),
      kind: "database",
      name: `Postgres (${graph.data.tables.length} tables)`,
      status: "live",
      region: "lovable-cloud",
      metadata: { tables: graph.data.tables.map((t) => t.name) },
    });
  }
  if (graph.auth?.signup || graph.auth?.login) {
    services.push({
      id: next(),
      kind: "auth",
      name: "Lovable Cloud Auth",
      status: "live",
      metadata: { rbac: graph.auth.rbac?.roles ?? [] },
    });
  }
  for (const fn of graph.api.edgeFunctions ?? []) {
    services.push({
      id: next(),
      kind: "edge-function",
      name: fn.name,
      status: "not-provisioned",
      metadata: { description: fn.description },
    });
  }
  for (const w of graph.workflows.workflows ?? []) {
    services.push({
      id: next(),
      kind: "scheduler",
      name: w.name ?? w.id,
      status: "not-provisioned",
    });
  }
  if (graph.data.tables.some((t) => t.realtime)) {
    services.push({ id: next(), kind: "realtime", name: "Realtime channel", status: "live" });
  }
  for (const b of graph.data.storageBuckets ?? []) {
    services.push({
      id: next(),
      kind: "storage",
      name: b.name,
      status: "not-provisioned",
      metadata: { public: b.public },
    });
  }
  return services;
}

export function buildInfraGraph(fullstack: FullstackGraph): InfraGraph {
  return {
    fullstack,
    services: deriveServices(fullstack),
    deployments: DeploymentEngine.list(),
    environments: EnvironmentManager.list(),
    generatedAt: Date.now(),
  };
}
