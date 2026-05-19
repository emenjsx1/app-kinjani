import { agentRegistry } from "./AgentRegistry";
import { plannerAgent } from "./PlannerAgent";
import { layoutAgent } from "./LayoutAgent";
import { uiAgent } from "./UIAgent";
import { copyAgent } from "./CopyAgent";
import { responsiveAgent } from "./ResponsiveAgent";
import { seoAgent } from "./SEOAgent";
import { fixAgent } from "./FixAgent";
import { exportAgent } from "./ExportAgent";

agentRegistry.register(plannerAgent);
agentRegistry.register(layoutAgent);
agentRegistry.register(uiAgent);
agentRegistry.register(copyAgent);
agentRegistry.register(responsiveAgent);
agentRegistry.register(seoAgent);
agentRegistry.register(fixAgent);
agentRegistry.register(exportAgent);

export { agentRegistry } from "./AgentRegistry";
export * from "./types";
export {
  plannerAgent,
  layoutAgent,
  uiAgent,
  copyAgent,
  responsiveAgent,
  seoAgent,
  fixAgent,
  exportAgent,
};
