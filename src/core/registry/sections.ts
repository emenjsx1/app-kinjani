import { componentRegistry } from "./registry";
import type { ComponentDefinition } from "./types";

/**
 * Section registry entries. Each mirrors a section type recognized by the
 * legacy template renderer in src/components/websites/sections/.
 *
 * Phase 2: definitions now carry runtime/export compatibility, AI hints, and
 * editable field metadata used by the new PropertiesPanel + AI agents.
 */

const def = (
  id: string,
  type: string,
  label: string,
  promptable: string[] = ["title", "subtitle", "description"],
  variants = [1, 2, 3],
  description?: string,
): ComponentDefinition => ({
  id,
  category: "section",
  type,
  label,
  description,
  variants,
  defaultProps: {},
  schema: {
    fields: promptable.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      kind: "string",
      aiEditable: true,
      responsive: false,
    })),
  },
  responsive: { perBreakpoint: [] },
  designTokens: { surface: "background", text: "foreground", accent: "primary" },
  editableFields: promptable,
  aiHints: { promptableFields: promptable },
  runtimeCompatibility: ["react-template", "export-tsx"],
  exportCompatibility: { tsx: true, html: true },
  generationPrompt: `Generate copy and layout for a "${label}" website section.`,
});

export const sectionDefinitions: ComponentDefinition[] = [
  def("section.hero", "hero", "Hero", ["title", "subtitle", "ctaText", "ctaAction"], [1, 2, 3], "Above-the-fold hero with primary CTA"),
  def("section.about", "about", "Sobre", ["title", "description"]),
  def("section.services", "services", "Serviços"),
  def("section.features", "features", "Funcionalidades"),
  def("section.testimonials", "testimonials", "Depoimentos"),
  def("section.cta", "cta", "Call to Action", ["title", "subtitle", "ctaText"]),
  def("section.contact", "contact", "Contacto"),
  def("section.team", "team", "Equipa"),
  def("section.gallery", "gallery", "Galeria"),
  def("section.pricing", "pricing", "Preços"),
  def("section.faq", "faq", "FAQ"),
];

let registered = false;
export function registerSections() {
  if (registered) return;
  registered = true;
  for (const d of sectionDefinitions) componentRegistry.register(d);
}
