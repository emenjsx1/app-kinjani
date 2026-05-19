/**
 * useSectionBBoxes
 *
 * Observes the DOM elements rendered by WebsitePreview (every section root
 * has `id="section-<id>"`) and maintains a stable map of their bounding
 * boxes relative to the canvas container. Uses ResizeObserver +
 * MutationObserver + window resize + canvas-scroll to invalidate, never
 * re-running on hover or selection updates.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { BoundingBox } from "@/core/editor/selection";
import { useInteractionStore } from "../store/interactionStore";

export interface SectionBBoxMap {
  [sectionId: string]: BoundingBox;
}

export function useSectionBBoxes(
  containerRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
  /** Re-runs when this value changes (e.g. project version). */
  version: unknown,
) {
  const [bboxes, setBBoxes] = useState<SectionBBoxMap>({});
  const layoutVersion = useInteractionStore((s) => s.layoutVersion);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      const containerRect = container.getBoundingClientRect();
      const nodes = content.querySelectorAll<HTMLElement>('[id^="section-"]');
      const next: SectionBBoxMap = {};
      nodes.forEach((el) => {
        const id = el.id.replace(/^section-/, "");
        const r = el.getBoundingClientRect();
        next[id] = {
          x: r.left - containerRect.left + container.scrollLeft,
          y: r.top - containerRect.top + container.scrollTop,
          width: r.width,
          height: r.height,
        };
      });
      setBBoxes(next);
    });
  }, [containerRef, contentRef]);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(content);
    content.querySelectorAll<HTMLElement>('[id^="section-"]').forEach((el) => ro.observe(el));

    const mo = new MutationObserver(() => measure());
    mo.observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });

    const onScroll = () => measure();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      mo.disconnect();
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [measure, version, layoutVersion, containerRef, contentRef]);

  return bboxes;
}
