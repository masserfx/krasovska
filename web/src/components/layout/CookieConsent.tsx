"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept(level: "all" | "necessary") {
    localStorage.setItem("cookie-consent", level);
    setVisible(false);
    if (level === "all" && typeof window !== "undefined" && "dataLayer" in window) {
      (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer.push({
        event: "consent_update",
        analytics_storage: "granted",
      });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-white p-4 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <p className="text-sm text-muted">
        Používáme cookies pro analýzu návštěvnosti. Více v{" "}
        <a href="/gdpr" className="underline hover:text-primary">
          ochraně osobních údajů
        </a>
        .
      </p>
      <div className="mt-3 flex gap-3 sm:mt-0 sm:shrink-0">
        <button
          onClick={() => accept("necessary")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          Pouze nezbytné
        </button>
        <button
          onClick={() => accept("all")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light"
        >
          Přijmout vše
        </button>
      </div>
    </div>
  );
}
