import { useEffect, useRef, useState } from "react";

interface SmoothPreviewProps {
  html: string;
  device: "desktop" | "tablet" | "mobile";
  title?: string;
}

/**
 * Cross-fades between iframe snapshots so live AI edits land smoothly
 * instead of producing the white "srcDoc reload" flash. The previous
 * frame is held visible until the new one paints, then fades out.
 */
export function SmoothPreviewIframe({ html, device, title = "preview" }: SmoothPreviewProps) {
  const [frontHtml, setFrontHtml] = useState(html);
  const [backHtml, setBackHtml] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const lastHtmlRef = useRef(html);

  useEffect(() => {
    if (html === lastHtmlRef.current) return;
    // Move current visible content to the back layer, then swap in the new HTML up front.
    setBackHtml(lastHtmlRef.current);
    setShowBack(true);
    lastHtmlRef.current = html;

    // Tiny delay lets the new front iframe mount/paint before we fade the back out.
    const fadeTimer = window.setTimeout(() => setShowBack(false), 180);
    const clearTimer = window.setTimeout(() => setBackHtml(null), 700);

    setFrontHtml(html);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [html]);

  return (
    <div className="relative w-full h-full">
      {backHtml && (
        <iframe
          key="back"
          srcDoc={backHtml}
          title={`${title}-prev`}
          className="absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ease-out"
          style={{ opacity: showBack ? 1 : 0, pointerEvents: "none" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
      <iframe
        key={`front-${device}`}
        srcDoc={frontHtml}
        title={title}
        className="relative w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
