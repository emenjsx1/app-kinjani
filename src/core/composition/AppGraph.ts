/**
 * AppGraph — multi-page application model. Replaces the implicit
 * "site = single page" mental model with a full route/layout tree.
 *
 * The AppGraph is the unit consumed by codegen for full-app generation
 * (dashboards, admin panels, SaaS shells). It supports:
 *  - nested layouts
 *  - route-scoped vs app-scoped state slices
 *  - per-route metadata (title, auth)
 */

import type { AppGraph, AppRoute, ComponentGraph, SharedStateSlice } from "./types";

export class AppGraphOps {
  static create(): AppGraph {
    return { pages: {}, layouts: {}, state: [] };
  }

  static addPage(app: AppGraph, route: AppRoute): AppGraph {
    return { ...app, pages: { ...app.pages, [route.path]: route } };
  }

  static removePage(app: AppGraph, path: string): AppGraph {
    const next = { ...app.pages };
    delete next[path];
    return { ...app, pages: next };
  }

  static updatePageGraph(app: AppGraph, path: string, graph: ComponentGraph): AppGraph {
    const page = app.pages[path];
    if (!page) throw new Error(`Page ${path} not found`);
    return { ...app, pages: { ...app.pages, [path]: { ...page, graph } } };
  }

  static addLayout(app: AppGraph, id: string, graph: ComponentGraph): AppGraph {
    return { ...app, layouts: { ...app.layouts, [id]: graph } };
  }

  static addState(app: AppGraph, slice: SharedStateSlice): AppGraph {
    if (app.state.some((s) => s.id === slice.id)) {
      throw new Error(`State slice ${slice.id} already exists`);
    }
    return { ...app, state: [...app.state, slice] };
  }

  static resolveLayoutFor(app: AppGraph, path: string): ComponentGraph | undefined {
    const page = app.pages[path];
    if (!page?.layoutId) return undefined;
    return app.layouts[page.layoutId];
  }
}
