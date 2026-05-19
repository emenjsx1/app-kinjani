import { registerSections } from "./sections";
import { registerWidgets } from "./widgets";

export * from "./types";
export * from "./registry";
export * from "./sections";
export * from "./widgets";

/** Eagerly register all built-in components on first import. */
registerSections();
registerWidgets();
