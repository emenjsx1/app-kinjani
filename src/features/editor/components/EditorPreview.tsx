import { memo, useMemo } from "react";
import { defaultPreviewEngine } from "@/core/preview";
import type { Project } from "@/core/projects/types";

interface Props {
  project: Project;
  embedConfig?: unknown;
}

export const EditorPreview = memo(function EditorPreview({ project, embedConfig }: Props) {
  const node = useMemo(
    () => defaultPreviewEngine.render(project, { embedConfig }),
    [project, embedConfig],
  );
  return <>{node}</>;
});
