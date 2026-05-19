/**
 * Builder feature shell. Phase 1 re-exports the editor shell as the default
 * builder surface; future builder modes (code, runtime, sandbox) plug in here.
 */
export { EditorShell as BuilderShell } from "@/features/editor/components/EditorShell";
