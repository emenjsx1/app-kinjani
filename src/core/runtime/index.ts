export * from "./types";
export * from "./RuntimeDiagnostics";
export * from "./RuntimeRegistry";
export * from "./SandpackRuntime";
export * from "./RegenerationScheduler";

import { runtimeRegistry } from "./RuntimeRegistry";
import { NoopRuntime } from "./types";
import { SandpackRuntime } from "./SandpackRuntime";

runtimeRegistry.register("noop", () => new NoopRuntime());
runtimeRegistry.register("sandpack", () => new SandpackRuntime());
