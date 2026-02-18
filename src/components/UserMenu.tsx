"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import type { UserRole } from "@/types/auth";
import { USER_ROLE_LABELS } from "@/types/auth";

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  reception: "bg-blue-100 text-blue-700",
  member: "bg-green-100 text-green-700",
};

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />;
  }

  if (!session) return null;

  const role = session.user.role as UserRole;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
      >
        <User className="h-4 w-4 text-muted" />
        <span className="hidden font-medium sm:inline">{session.user.name}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}>
          {USER_ROLE_LABELS[role]}
        </span>
        <ChevronDown className="h-3 w-3 text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-white shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted">{session.user.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => signOut({ callbackUrl: "/prihlaseni" })}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Odhlásit se
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
