"use client";

import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <Cloud className="h-3.5 w-3.5" />
        Připojeno
      </span>
    );
  }

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary-light">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Ukládání...
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success">
        <Check className="h-3.5 w-3.5" />
        Uloženo
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-danger">
      <AlertCircle className="h-3.5 w-3.5" />
      Chyba ukládání
    </span>
  );
}
