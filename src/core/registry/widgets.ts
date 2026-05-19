import { componentRegistry } from "./registry";
import type { ComponentDefinition } from "./types";

const def = (id: string, type: string, label: string): ComponentDefinition => ({
  id,
  category: "widget",
  type,
  label,
  variants: [1],
  defaultProps: {},
  schema: { fields: [] },
});

export const widgetDefinitions: ComponentDefinition[] = [
  def("widget.counter", "counter", "Contador"),
  def("widget.accordion", "accordion", "Acordeão"),
  def("widget.tabs", "tabs", "Abas"),
  def("widget.slider", "slider", "Slider"),
  def("widget.pricing-table", "pricing-table", "Tabela de Preços"),
  def("widget.video", "video", "Vídeo"),
  def("widget.image-text", "image-text", "Imagem + Texto"),
  def("widget.icon-box", "icon-box", "Caixa de Ícone"),
  def("widget.divider", "divider", "Divisor"),
  def("widget.spacer", "spacer", "Espaçador"),
];

let registered = false;
export function registerWidgets() {
  if (registered) return;
  registered = true;
  for (const d of widgetDefinitions) componentRegistry.register(d);
}
