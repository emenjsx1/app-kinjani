# PHASE 2 — Open Builder Editor Migration

Approved scope: apply 11 architectural improvements, then migrate the visual editor off `WebsiteEditor.tsx` onto the new modular shell. Maintain `?legacy=1` rollback. Preserve visual parity, responsive behavior, and all current functionality.

## Stage A — Pre-flight architectural hardening (types & interfaces only, zero runtime regression)

Type-only extensions; no behavioral changes to existing flows. Each item lists files.

### A1. Filesystem foundation extension
Files: `src/core/filesystem/types.ts`, `src/core/filesystem/InMemoryFileSystem.ts` (additive only).
Add:
- `FileDependency` — `{ from: string; to: string; kind: 'import'|'asset'|'style'|'component' }`
- `ImportReference` — `{ path: string; specifiers: string[]; isDefault: boolean; isTypeOnly?: boolean }`
- `GeneratedArtifact` — `{ id: string; sourcePath: string; generator: string; componentId?: string; checksum: string; createdAt: string }`
- `FileVersion` — `{ path: string; versionId: string; hash: string; createdAt: string; authorAgent?: string }`
- Extend `FileSystem` interface with **optional** `dependencies?()`, `versions?(path)`, `artifacts?()` returning empty by default in `InMemoryFileSystem`.

### A2. Component Registry evolution
Files: `src/core/registry/types.ts`, `src/core/registry/sections.ts`, `src/core/registry/widgets.ts` (extend defaults, do not break consumers).
Extend `ComponentDefinition`:
- `slots?: Array<{ id: string; accepts: ComponentCategory[]; min?: number; max?: number }>` (composition/nested)
- `dynamicProps?: boolean`
- `responsiveRules?: Record<string, { hidden?: boolean; props?: Record<string, unknown> }>` (sm/md/lg/xl)
- `designTokens?: { surface?: string; text?: string; accent?: string }`
- `inherits?: string` (style inheritance)
- `generationPrompt?: string`
- `editableFields?: string[]` (canonicalize prior `aiHints.promptableFields`)
- `runtimeCompatibility?: Array<'react-template'|'sandpack'|'webcontainer'|'export-tsx'>`
- `exportCompatibility?: { tsx: boolean; html?: boolean }`

Set sensible defaults for the existing 11 sections + 10 widgets (all `runtimeCompatibility: ['react-template','export-tsx']`).

### A3. AI Operations metadata + chains
Files: `src/core/ai/types.ts`, `src/core/ai/operations.ts`, `src/core/ai/applier.ts`.
Add `OperationMeta`:
```
operationId, parentOperationId?, sourceAgent, operationGroup?,
rollbackable, affectedFiles[], affectedComponents[], createdAt, dependsOn?: string[]
```
Wrap existing `AIOperation` union into `AIOperationEnvelope = { meta: OperationMeta; op: AIOperation }`.
Add:
- `OperationPlan = { id; envelopes: AIOperationEnvelope[]; strategy: 'sequential'|'parallel' }`
- `OperationResult = { operationId; ok; error?; rollbackOp?: AIOperation }`
- `OperationConflict` resolver stub (interface only).
Applier accepts both raw `AIOperation` (legacy) and `AIOperationEnvelope[]` (new); produces `OperationResult[]`.

### A4. Preview Engine expansion
Files: `src/core/preview/PreviewEngine.ts`, `src/core/preview/ReactTemplatePreviewEngine.tsx`, new `src/core/preview/diagnostics.ts`.
Extend interface:
- `capabilities: { interactive: boolean; isolated: boolean; supportsConsole: boolean; supportsNetwork: boolean }`
- `health(): { status: 'idle'|'rendering'|'ready'|'error'; lastError?: string }`
- `diagnostics(): { logs: RuntimeLog[]; errors: RuntimeError[] }`
- `dispose?(): void`
Add `PreviewEngineRegistry` (id → factory) for future Sandpack/WebContainer/Remote engines.

### A5. History engine — operation-aware + groups
Files: `src/core/history/HistoryEngine.ts`, `src/features/editor/store/historyStore.ts`.
Add:
- `pushOperation(envelope: AIOperationEnvelope)` alongside existing `pushSnapshot`
- `beginGroup(label, sourceAgent?) / endGroup()` returning groupId (already partially present — formalize)
- `undoTo(operationId)` and `redoTo(operationId)` (selective undo)
- `serialize() / hydrate()` for future collab/persistence
- Internal mode flag: `mode: 'snapshot'|'operation'|'hybrid'` (default hybrid)

### A6. Project model — universal builder entity
Files: `src/core/projects/types.ts`, `src/core/projects/repository.ts`.
Extend `Project`:
- `pages: ProjectPage[]` (default single page wraps current website sections)
- `layouts: ProjectLayout[]`
- `routes: { path: string; pageId: string; layoutId?: string }[]`
- `assets: { id; path; type; refs: string[] }[]` (assets graph)
- `seo: { title?; description?; ogImage?; canonical?; jsonLd?: unknown }`
- `deployment?: { target?: 'vercel'|'netlify'|'lovable'; lastDeployedAt?: string }`
- `env?: Record<string, string>` (non-secret)
Repository: add `getPage`, `addPage`, `updateSeo` no-op stubs backed by in-memory.

### A7. Editor engine prep
Files: new under `src/core/editor/`:
- `dnd.ts` — `DndController` interface (`begin/over/drop/cancel`), no impl
- `selection.ts` — `SelectionOverlay` types (`bbox`, `handles`, `label`)
- `spacing.ts` — `SpacingModel` (`m/p` per side, breakpoint-aware)
- `breakpoints.ts` — `Breakpoint = 'sm'|'md'|'lg'|'xl'`, default map
- `keymap.ts` — `KeyBinding` registry (extends current shortcuts)
- `canvas.ts` — `CanvasAdapter` interface for future canvas-rendered editing
Wire types into `src/core/editor/index.ts`. No UI yet.

### A8. Performance pre-work
- Convert `SectionsPanel`, `LayersPanel`, `PropertiesPanel`, `AIChatPanel` to `React.memo` with stable selectors via Zustand `useShallow`.
- `EditorSidebar` panels lazy-loaded with `React.lazy` + `Suspense` fallback (skeleton).
- `AIChatPanel` dynamic import only when AI tab is opened.
- Add `useStableCallback` util in `src/shared/hooks`.

## Stage B — Editor surface migration (Phase 2 core)

### B1. EditorShell becomes primary
`src/pages/WebsiteEditorPage.tsx`: read `?legacy=1` query param.
- `legacy=1` → render existing `WebsiteEditor` (unchanged).
- default → render new `EditorShell` mounted full-screen with `WebsitePreview` inside `EditorCanvas`.

### B2. Wire real data into the new shell
- `EditorShell` loads the website via existing `useWebsites` hook by `id`.
- Initializes `editorStore` (project id, mode='edit', device='desktop').
- Initializes `historyStore` with first snapshot.
- Save button (header) calls existing `useWebsites().updateWebsite` with serialized state from store (visual parity with legacy save).

### B3. Panels feature parity
Iterate each legacy panel and port to new components:
- **SectionsPanel** — list from `componentRegistry.byCategory('section')` + drag-to-add via simple click-add (DnD wire stub only).
- **LayersPanel** — tree from current project sections; click selects → updates `editorStore.selectedId`.
- **PropertiesPanel** — render fields from `ComponentDefinition.schema` for the selected section/widget; on change emits `setSectionProp` envelope through applier + history.
- **AIChatPanel** — wraps existing `EditorAIChat` logic via `useEditorAI`, dynamic-imported.
- **EditorToolbar** — device switcher, undo/redo (bound to `historyStore`), preview mode toggle.
- **EditorHeader** — title, save, exit, legacy-mode link (`?legacy=1`).
- **EditorCanvas/Preview** — hosts `WebsitePreview` (unchanged renderer for visual parity). Selection overlay (Stage A7 types) added as absolutely-positioned outline only.
- **FloatingActions** — quick-add, ai-edit shortcut.

### B4. Keyboard + history wiring
`useEditorShortcuts`: Ctrl/Cmd+Z, Shift+Z/Y, Cmd+S (save), Esc (deselect), Arrow nav between layers.

### B5. Migrate `WebsiteEditor.tsx` to compatibility wrapper
After parity reached & smoke-tested, reduce `src/components/websites/WebsiteEditor.tsx` to a thin wrapper that warns once and renders the new `EditorShell`. Keep file (legacy route still imports it under `?legacy=1`).

## Stage C — Validation

- `tsc --noEmit` green.
- All existing routes load; `/websites/:id/edit` renders new shell.
- `?legacy=1` renders prior editor identically.
- Save round-trip writes same payload shape (verified by reading `useWebsites.updateWebsite` body).
- Undo/redo works across prop edits.
- AI chat edit produces an `AIOperationEnvelope`, runs through applier, recorded in history.
- No console errors, no network regressions.

## Out of scope (later phases)
- Real drag-and-drop runtime (Stage A7 ships types only)
- Sandpack engine (Phase 6)
- New DB tables / migrations (Phase 4)
- Edge function rewrite for structured outputs (Phase 3) — adapter remains
- Code generation emit to TSX files (Phase 5)
- verify_jwt rollout (Phase 7)

## Execution order
A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → B1 → B2 → B3 → B4 → B5 → C.

Estimated files touched: ~25 edited, ~8 created. Risk: low (additive types + new surface gated by feature flag).
