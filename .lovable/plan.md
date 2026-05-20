
# Phase I — AI-First Generation Core Rewrite

Goal: replace the section-first, template-mutation generation brain with an intention-first creative reasoning pipeline that invents composition from zero, critiques itself visually, and regenerates until quality passes.

## 1. Audit & remove hidden template DNA

Sweep the generation paths and strip baked-in section/layout/hero/CTA assumptions:

- `src/core/render/buildBrief.ts`, `CompositionGenerator.ts`, `templateToGraph.ts`
- `src/lib/website-templates.ts`, `src/lib/creative-composition.ts`
- `src/components/websites/sections/*` (Hero/Features/CTA/FAQ defaults)
- `src/core/registry/sections.ts`, `registry/widgets.ts`
- `OpenCreator.tsx`, `CreateWebsiteWizard.tsx` default flows

Action: mark the section registry as a *fallback render adapter only*, not a generation source. Remove hero-first / features-then-CTA ordering, fixed spacing, default grids, default typography scales.

## 2. New module: `src/core/genesis/` (Generative Composition Engine)

Replaces template-driven generation. Layers (intention → composition → critique → regeneration):

```text
Intent  →  Semantics  →  CreativeBrief  →  EnergyProfile
   →  CompositionPlan  →  HierarchyPlan  →  RhythmPlan
   →  SpatialPlan  →  TypographyLogic  →  InteractionPlan
   →  GenerativeGraph  →  Render  →  VisualCritique
   →  RegenerationLoop  →  FinalComposition
```

Files:

- `genesis/types.ts` — `Intent`, `EnergyProfile`, `CompositionPlan`, `HierarchyNode`, `RhythmSpec`, `SpatialSpec`, `InteractionSpec`, `CritiqueReport`, `GenerativeGraph`
- `genesis/IntentInterpreter.ts` — semantic parse of user prompt → goals, audience, emotion, domain, references
- `genesis/EnergyEngine.ts` — picks visual energy (cinematic, editorial, brutalist, luxurious, fintech-premium, experimental, playful…) seeded by DNA + intent
- `genesis/CompositionPlanner.ts` — invents an abstract scene graph: focal moments, narrative beats, tension points. Never emits "hero/features/cta" — emits beats like `opening-statement`, `proof-moment`, `quiet-pause`, `decision-call`
- `genesis/HierarchyPlanner.ts` — emphasis weights, focal density, breathing zones
- `genesis/RhythmPlanner.ts` — pacing curve across the page (dense/loose alternation, asymmetry bias from DNA)
- `genesis/SpatialPlanner.ts` — invents grid system per project (not 12-col default); supports broken/overlap/editorial/bento/asymmetric
- `genesis/TypographyLogic.ts` — invented scale + voice cadence per project
- `genesis/InteractionPlanner.ts` — motion personality, reveal flow, scroll choreography
- `genesis/GenerativeGraphBuilder.ts` — turns plans into a `GenerativeGraph` of arbitrary nodes (not bound to section types)
- `genesis/index.ts` — `generateExperience(intent, dna) → GenerativeGraph`

## 3. Visual Reasoning + Critique loop

New module `src/core/critique/`:

- `VisualCritiqueEngine.ts` — renders current graph offscreen, captures canvas via the existing visual context builder, sends to multimodal model (Gemini 2.5 Pro vision) with a critique rubric: template-feeling, repeated rhythm, weak hierarchy, generic SaaS sameness, spacing monotony, focal collapse
- `CritiqueRubric.ts` — scored axes (originality, hierarchy, rhythm, tension, density, focal clarity, predictability)
- `RegenerationScheduler.ts` (extend existing one in `core/runtime/`) — on critique fail, target the weak region(s) and request the planner to re-invent only those beats; loop until threshold or N rounds
- Wire into `CreativeOrchestrator` from `src/core/ai/creative-os/`

## 4. Agent role shift: authors, not editors

Update `src/core/ai/creative-os/agents/`:

- `CreativeDirectorAgent` → now drives `genesis.generateExperience` end-to-end, not section selection
- New specialist agents: `CompositionAuthorAgent`, `HierarchyAuthorAgent`, `RhythmAuthorAgent`, `TypographyAuthorAgent`, `InteractionAuthorAgent`, `CritiqueAgent`, `RegenerationAgent`
- Remove "edit existing section" code paths from agent prompts; replace with "invent / re-invent" instructions
- Agents communicate via existing `AgentCommunicationBus`

## 5. Renderer adapts to GenerativeGraph

`CompositionRenderer.tsx` already DNA-aware. Extend:

- Render arbitrary node types from `GenerativeGraph` (not just known section components)
- Add a `FreeformBlockRenderer` that maps invented nodes → freeform TSX via existing `core/freeform/` pipeline
- Existing section components become *one possible adapter*, used only when the planner explicitly chooses a conventional beat

## 6. AI-first UX

- `WebsitesPage` + `CreateWebsiteWizard`: collapse manual block flow; promote a single conversational intent input ("Describe the experience you want to create")
- New page/section in `WebsiteEditor`: "Creative Session" panel showing live agent thinking, critique scores, regeneration events (reuse `AgentActivityPanel`)
- Manual editing remains accessible but moved to a secondary "Refine" tab
- `OpenCreator.tsx` becomes the default; guided template mode is demoted to "Quick start" tucked behind a link

## 7. Energy + variability guarantees

- `EnergyEngine` + DNA must produce visibly different outputs for two prompts in the same niche (success criterion). Add `tests/genesis-divergence.test.ts` (vitest) that generates two graphs from the same niche prompt and asserts structural divergence on rhythm, hierarchy weights, spatial grid kind, energy label, node count and ordering

## 8. Edge function updates

- `supabase/functions/generate-website-content/index.ts` — replace section-list prompt with intention/composition prompt; output a `GenerativeGraph` JSON via structured output (AI SDK `Output.object`)
- `supabase/functions/ai-edit-website/index.ts` — accept critique reports and regenerate targeted regions instead of editing flat section JSON

## Technical details

- Keep `CompositionGraph` as the *runtime* graph; `GenerativeGraph` is its authored superset (invented node types resolve to composition nodes via a resolver)
- DNA from `core/dna` feeds every planner as a seed, ensuring per-project uniqueness already enforced
- Multimodal critique reuses `core/ai/context/VisualAIContextBuilder` for canvas capture
- Model defaults: `google/gemini-2.5-pro` for critique (vision), `openai/gpt-5.4` for planning, `google/gemini-3.5-flash` for fast regeneration passes
- All model calls server-side via Lovable AI Gateway with AI SDK `streamText` / `generateObject`
- Backwards-compat: existing websites keep rendering through the section adapter; new generations go through `genesis`

## Out of scope (this phase)

- Removing section components from disk (kept as render adapters)
- Changing auth, billing, WhatsApp, agents-non-creative subsystems
- Migrating already-saved websites to the new graph

## Deliverable shape

```text
src/core/genesis/*           ← new generative engine
src/core/critique/*          ← visual self-critique loop
src/core/ai/creative-os/agents/* ← rewritten as authors
src/core/render/CompositionRenderer.tsx ← generative-graph aware
src/components/websites/CreativeSessionPanel.tsx ← live thinking UI
supabase/functions/generate-website-content/ ← intention-first prompt
supabase/functions/ai-edit-website/ ← regeneration-first
tests/genesis-divergence.test.ts
```

After this phase: two prompts in the same niche must produce structurally different experiences, the AI must render → critique → regenerate without user action, and manual section insertion is no longer the primary creation path.
