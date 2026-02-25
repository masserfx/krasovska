"use client";

import { Eye, X } from "lucide-react";
import { USER_ROLE_LABELS } from "@/types/auth";
import type { UserRole } from "@/types/auth";

interface ImpersonationBannerProps {
  name: string;
  role: UserRole;
  onStop: () => void;
}

export default function ImpersonationBanner({ name, role, onStop }: ImpersonationBannerProps) {
  return (
    <div className="no-print sticky top-0 z-[60] flex items-center justify-center gap-3 bg-amber-400 px-4 py-1.5 text-sm font-medium text-amber-950">
      <Eye className="h-4 w-4 shrink-0" />
      <span>
        Prohlížíte jako: <strong>{name}</strong> ({USER_ROLE_LABELS[role] ?? role})
      </span>
      <button
        onClick={onStop}
        className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-950/10 px-2.5 py-0.5 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-950/20"
      >
        <X className="h-3 w-3" />
        Ukončit
      </button>
    </div>
  );
}
