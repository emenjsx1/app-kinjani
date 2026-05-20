/**
 * Phase H — DevOpsAgent.
 * Orchestrates deployments, migrations, environment switches and monitoring.
 * Plugs into the existing Creative OS agent bus so the live activity panel
 * surfaces devops actions next to design agents.
 */

import type { DevOpsPlan, DevOpsPlanStep, InfraGraph } from "./types";
import { DeploymentEngine } from "./DeploymentEngine";
import { MigrationExecutor } from "./MigrationExecutor";
import { executionBus } from "./ExecutionBus";
import { agentBus, makeMessage } from "@/core/ai/creative-os/AgentCommunicationBus";

let seq = 0;
const id = (p: string) => `${p}_${Date.now()}_${++seq}`;

export const DevOpsAgent = {
  name: "DevOpsAgent",

  plan(goal: string, infra: InfraGraph): DevOpsPlan {
    const steps: DevOpsPlanStep[] = [];

    if (infra.fullstack.data.tables.length) {
      steps.push({
        id: id("step"),
        title: `Compile & queue migrations for ${infra.fullstack.data.tables.length} tables`,
        kind: "migrate",
        targets: infra.fullstack.data.tables.map((t) => t.name),
        estDurationMs: 1500,
      });
    }
    if (infra.fullstack.api.endpoints.length) {
      steps.push({
        id: id("step"),
        title: `Deploy ${infra.fullstack.api.endpoints.length} API endpoints`,
        kind: "deploy",
        targets: infra.fullstack.api.endpoints.map((e) => e.path),
        estDurationMs: 4000,
      });
    }
    const activeEnv = infra.environments.find((e) => e.active);
    steps.push({
      id: id("step"),
      title: `Promote build to ${activeEnv?.name ?? "preview"}`,
      kind: "deploy",
      targets: [activeEnv?.kind ?? "preview"],
      estDurationMs: 3000,
    });
    steps.push({
      id: id("step"),
      title: "Attach runtime monitors",
      kind: "monitor",
      targets: ["logs", "traces", "health"],
      estDurationMs: 800,
    });

    const plan: DevOpsPlan = { goal, steps, createdAt: Date.now() };
    agentBus.publish(
      makeMessage("devops" as never, {
        kind: "status",
        severity: "info",
        text: `Plan ready: ${plan.steps.length} steps for "${goal}"`,
      } as never),
    );
    return plan;
  },

  async execute(plan: DevOpsPlan, infra: InfraGraph): Promise<void> {
    for (const step of plan.steps) {
      executionBus.publish({
        kind: "log",
        level: "info",
        source: this.name,
        message: `→ ${step.title}`,
      });
      if (step.kind === "migrate") {
        MigrationExecutor.compile(infra.fullstack);
      }
      if (step.kind === "deploy") {
        await DeploymentEngine.deploy({
          environment: (step.targets[0] as never) ?? "preview",
        });
      }
      if (step.kind === "monitor") {
        executionBus.publish({
          kind: "trace",
          level: "info",
          source: this.name,
          message: "Monitors attached: logs / traces / health",
        });
      }
      if (step.kind === "rollback") {
        const last = DeploymentEngine.list()[0];
        if (last) await DeploymentEngine.rollback(last.id);
      }
    }
  },
};
