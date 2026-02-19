"use client";

import { useRef, useState } from "react";

export default function BriefingViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);

  function handlePrint() {
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.print();
    }
  }

  return (
    <div>
      {/* Action buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={handlePrint}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Tisk
        </button>
        <a
          href="/docs/CEO_BRIEFING.pdf"
          download
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          Stáhnout PDF
        </a>
      </div>

      {/* Briefing iframe or error */}
      {loadError ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center">
          <p className="text-muted">
            CEO Briefing zatím není k dispozici.
          </p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src="/api/bistro/briefing"
          className="w-full rounded-lg border-none"
          style={{ height: "80vh" }}
          onError={() => setLoadError(true)}
          onLoad={(e) => {
            // Check if the iframe loaded an error page
            try {
              const doc = (e.target as HTMLIFrameElement).contentDocument;
              if (doc && doc.title === "404") {
                setLoadError(true);
              }
            } catch {
              // Cross-origin — assume it loaded fine
            }
          }}
        />
      )}
    </div>
  );
}
