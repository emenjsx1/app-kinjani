## Kinjani Open Builder — Phase 1: Foundation Refactor

Evolve Kinjani from a template-only website editor into a scalable AI Builder foundation (Lovable/v0/Bolt-style), without breaking any existing functionality. This phase is **architecture + modularization only** — no Sandpack, no real code generation runtime, no deploy system yet.

### Guiding principles

- **Zero regressions**: every current route, agent, website, automation and AI flow keeps working.
- **Hybrid architecture**: legacy template renderer keeps running side-by-side with the new builder core.
- **Strict TypeScript, clean boundaries**: `core/` (engine), `features/` (product surfaces), `shared/` (cross-cutting).
- **Real code, not stubs**: every new module must compile, be wired in, and replace at least one piece of the current implementation.

---

### 1. New folder architecture

```text
src/
├── core/
│   ├── builder/        # builder orchestration entry points + types
│   ├── filesystem/     # VFS types + in-memory adapter (no runtime yet)
│   ├── runtime/        # runtime abstraction interface
│   ├── preview/        # PreviewEngine interface + ReactTemplatePreview impl
│   ├── generator/      # code-gen interface (stub impl returns template JSON)
│   ├── agents/         # AI agent contracts (planner/ui/copy/seo/fix)
│   ├── registry/       # ComponentRegistry: sections + widgets metadata
│   ├── editor/         # editor engine: selection, mode, commands
│   ├── history/        # snapshot + grouped-action history engine
│   ├── projects/       # Project domain model + repository interface
│   └── ai/             # AI operation pipeline (prompt → op → apply)
│
├── features/
│   ├── websites/       # current website pages re-homed here
│   ├── agents/         # current agents pages re-homed here
│   ├── projects/       # project list/detail wrapper around websites+agents
│   ├── builder/        # builder shell (uses core/editor)
│   └── editor/         # editor UI (the split WebsiteEditor lives here)
│       ├── components/ EditorSidebar, EditorToolbar, EditorCanvas,
│                       PropertiesPanel, SectionsPanel, LayersPanel,
│                       EditorPreview, EditorHeader, AIChatPanel,
│                       FloatingActions
│       ├── hooks/      useEditorState, useEditorHistory, useEditorSelection,
│                       useEditorActions, useEditorShortcuts, useEditorAI
│       ├── store/      editorStore (Zustand), historyStore
│       └── types/
│
└── shared/
    ├── ui/             # re-export of components/ui (no breakage)
    ├── hooks/  utils/  types/  constants/  services/
```

Existing paths (`src/components/...`, `src/pages/...`, `src/hooks/...`) stay in place; new code imports from `core/`, `features/editor`, `shared/`. Pages are updated to mount the new editor shell — the old `WebsiteEditor.tsx` becomes a thin compatibility wrapper that delegates to `features/editor`.

---

### 2. WebsiteEditor refactor (the critical one)

Split today's `src/components/websites/WebsiteEditor.tsx` + `WebsiteEditorPage.tsx` into the structure above. Concrete extraction:

- **EditorHeader** — title, save state, publish, mode switcher (edit/preview/responsive).
- **EditorToolbar** — undo/redo, device, zoom, AI toggle.
- **EditorSidebar** — tabs host for Sections / Layers / Properties / AI.
- **SectionsPanel** — add/reorder sections from registry.
- **LayersPanel** — tree view of pages → sections → widgets.
- **PropertiesPanel** — edits the currently selected node via registry schema.
- **EditorCanvas + EditorPreview** — renders via `PreviewEngine` (default = React template engine, identical visual output to today).
- **AIChatPanel** — current `EditorAIChat` re-homed, talks to `core/ai`.
- **FloatingActions** — quick add, AI prompt, save.

All business logic moves into hooks (`useEditorState`, `useEditorHistory`, …) and the Zustand store. Components become presentational.

---

### 3. State management

Zustand for editor + history (lighter than Redux, fits Lovable patterns). Two stores:

- `editorStore` — activeProjectId, selection (sectionId / widgetId), mode (edit|preview), device (desktop|tablet|mobile), AI panel state, dirty flag.
- `historyStore` — bounded ring buffer (≤50) of immutable project snapshots, with `beginGroup/endGroup` for grouped actions. Replaces the in-memory `useEditorHistory` array.

Selectors + `shallow` to keep rerenders local. Heavy panels wrapped in `React.memo`; canvas section list keyed and virtualized-ready.

---

### 4. Project + Filesystem foundation (types only, no runtime)

```ts
// core/projects/types.ts
export type ProjectKind = "website" | "agent" | "hybrid";
export interface Project {
  id: string; name: string; kind: ProjectKind;
  template?: string;
  pages: ProjectPage[];
  assets: ProjectAsset[];
  theme: ProjectTheme;
  settings: ProjectSettings;
  metadata: Record<string, unknown>;
  files?: FileTree;        // future
}
export interface ProjectPage { id: string; slug: string; sections: WebsiteSection[]; }
```

```ts
// core/filesystem/types.ts
export interface ProjectFile { path: string; content: string; lang: string; hash: string; }
export interface ProjectFolder { path: string; children: Array<ProjectFile | ProjectFolder>; }
export interface FileTree { root: ProjectFolder; }
export type FileOperation =
  | { op: "create"; file: ProjectFile }
  | { op: "update"; path: string; content: string }
  | { op: "delete"; path: string }
  | { op: "rename"; from: string; to: string }
  | { op: "move";   from: string; to: string };
```

Ship an `InMemoryFileSystem` adapter implementing a `FileSystem` interface (apply/list/read). Not wired into rendering yet — the current template renderer remains the source of truth.

---

### 5. Component Registry

`core/registry/registry.ts` exposes a typed registry of all sections + widgets currently in `src/components/websites/sections/` and `widgets/`:

```ts
export interface ComponentDefinition<TProps = unknown> {
  id: string; category: "section" | "widget";
  label: string; icon?: string; variants: string[];
  defaultProps: TProps;
  schema: PropSchema;        // drives PropertiesPanel
  responsive?: ResponsiveSchema;
  aiHints?: { promptableFields: string[] };
}
```

Sections/widgets register themselves via a thin adapter file (no behavior change). PropertiesPanel + SectionsPanel + future AI editor all consume this registry.

---

### 6. AI architecture

`core/ai/` introduces an operation pipeline:

```text
prompt → Planner → AIOperation[] → Applier (mutates project via editor commands) → History snapshot
```

- `AIOperation` discriminated union: `setSectionProp`, `addSection`, `removeSection`, `reorderSections`, `editCopy`, `setTheme`, `noop`.
- Agent contracts (interfaces only): `PlannerAgent`, `UIAgent`, `CopyAgent`, `SeoAgent`, `FixAgent`.
- Current `useWebsiteAI` / `ai-edit-website` Edge Function are wrapped behind a `WebsiteAIService` in `core/ai/services/`. No Edge Function changes in this phase.

---

### 7. Preview Engine

`core/preview/PreviewEngine.ts` interface:

```ts
export interface PreviewEngine {
  id: "react-template" | "sandpack" | "runtime";
  render(project: Project, opts: PreviewOptions): ReactNode;
}
```

Default impl `ReactTemplatePreviewEngine` wraps today's `WebsitePreview`. Sandpack/runtime engines are not built — interface is ready for them.

---

### 8. History engine

`core/history/HistoryEngine.ts`: snapshot-based, supports `push`, `undo`, `redo`, `beginGroup/endGroup`, `clear`, capacity config. `historyStore` is a thin Zustand wrapper. Replaces the ad-hoc undo array. Persistence stays in-memory this phase, but the engine exposes `serialize()` ready for future `project_versions` table.

---

### 9. Database preparation (no migrations yet)

Document target tables in `core/projects/schema.future.ts` as TS types only:
`project_versions`, `project_files`, `generated_components`, `ai_operations`, `builder_sessions`. No SQL migration runs in this phase — existing schema untouched.

---

### 10. Performance + security hygiene

- `React.lazy` + `Suspense` on `AIChatPanel`, `PropertiesPanel`, `LayersPanel`.
- `memo` on section renderers; selectors via Zustand `shallow`.
- All AI operations pass through a single `applyOperation` validator (Zod schema per op) — foundation for future sandbox/permissions.

---

### Out of scope (explicitly deferred)

- Sandpack integration, real runtime preview, real code generation, terminal, docker, deploy/export.
- New Supabase tables/migrations.
- Edge Function rewrites.
- Visual drag-and-drop implementation (architecture supports it; UI wiring lands in Phase 2).

---

### Acceptance checklist

- App builds, all existing routes work identically for the end user.
- `/websites/:id/edit` renders via the new `features/editor` shell with the same visual result.
- Old `WebsiteEditor.tsx` reduced to a compatibility wrapper (<50 lines) delegating to the new shell.
- Zustand editor + history stores in use; undo/redo works.
- Component registry powers SectionsPanel + PropertiesPanel.
- `core/` modules compile, are imported by `features/editor`, and have no circular deps.

### Suggested execution order

1. Scaffold `core/`, `features/`, `shared/` with types + empty modules.
2. Implement registry + project types + history engine + Zustand stores.
3. Build new editor components, port logic out of `WebsiteEditor.tsx` hook-by-hook.
4. Swap `WebsiteEditorPage` to mount the new shell; keep old file as wrapper.
5. Wire AI service + preview engine abstractions.
6. Verify build, click through editor, agents, websites, automations.

This is a large but contained refactor (~30–50 new files, ~10 edited). Approve and I'll execute it in that order.