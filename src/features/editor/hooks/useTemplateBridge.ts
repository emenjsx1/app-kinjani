/**
 * Template bridge — exposes the active TemplateApi through React context so
 * deep components (AIChatPanel, future plug-ins) can mutate the project
 * without prop drilling.
 */
import { createContext, useContext } from "react";
import type { TemplateApi } from "./useTemplateState";

export const TemplateBridgeContext = createContext<TemplateApi | null>(null);

export function useTemplateBridge(): TemplateApi | null {
  return useContext(TemplateBridgeContext);
}
