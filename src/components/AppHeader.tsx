"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  ClipboardList,
  Shield,
  ShoppingCart,
  Package,
  Receipt,
  FileText,
  UtensilsCrossed,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/types/auth";

const STORAGE_KEY = "hala-krasovska-active-qid";

interface TabDef {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  minRole?: UserRole;
  appendQid?: boolean;
}

const tabs: TabDef[] = [
  { id: "dashboard",    label: "Dashboard",   href: "/dashboard",              icon: LayoutDashboard, minRole: "member",    appendQid: true },
  { id: "projects",     label: "Projekty",    href: "/projects",               icon: FolderKanban,    minRole: "member" },
  { id: "bistro",       label: "Bistro",      href: "/bistro",                 icon: UtensilsCrossed, minRole: "member" },
  { id: "questionnaire",label: "Dotazník",    href: "/",                       icon: ClipboardList,   minRole: "member",    appendQid: true },
  { id: "analysis",     label: "Analýza",     href: "/analysis",               icon: BarChart3,       minRole: "admin",     appendQid: true },
  { id: "users",        label: "Uživatelé",   href: "/users",                  icon: Users,           minRole: "admin" },
  { id: "sessions",     label: "Relace",      href: "/sessions",               icon: FileText,        minRole: "admin" },
  { id: "audit",        label: "Audit",       href: "/audit",                  icon: Shield,          minRole: "admin" },
  { id: "eshop",        label: "E-shop",      href: "/eshop",                  icon: ShoppingCart },
  { id: "eshop-admin",  label: "Produkty",    href: "/eshop/admin",            icon: Package,         minRole: "admin" },
  { id: "sklad",        label: "Sklad",       href: "/eshop/admin/sklad",      icon: Warehouse,       minRole: "reception" },
  { id: "objednavky",   label: "Objednávky",  href: "/eshop/admin/objednavky", icon: Receipt,         minRole: "reception" },
];

function visibleTabs(role: UserRole | undefined, sectionPerms: string[] | null): TabDef[] {
  if (!role) return tabs.filter((t) => !t.minRole);
  if (role === "admin") return tabs;

  if (sectionPerms !== null) {
    // Explicit per-user permissions: show tab if id is in the list, or tab is public
    return tabs.filter((t) => !t.minRole || sectionPerms.includes(t.id));
  }

  // Fall back to role-based minRole defaults
  return tabs.filter((t) => {
    if (!t.minRole) return true;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[t.minRole];
  });
}

function HeaderContent({ activeTab }: { activeTab: string }) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const idFromUrl = searchParams.get("id");
  const [storedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  // Live-refresh permissions from DB so changes take effect without re-login
  const [livePerms, setLivePerms] = useState<string[] | null | undefined>(undefined);
  const [lowStockCount, setLowStockCount] = useState(0);
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setLivePerms(d.section_permissions ?? null))
      .catch(() => setLivePerms(null));
  }, [session?.user?.id]);

  // Low stock badge — only for roles that can see the stock tab
  useEffect(() => {
    const r = session?.user?.role;
    if (!r || !["admin", "coordinator", "reception"].includes(r)) return;
    fetch("/api/eshop/stock")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d) setLowStockCount(d.low_stock_count ?? 0); })
      .catch(() => {});
  }, [session?.user?.role]);

  const id = idFromUrl ?? storedId;
  const role = session?.user?.role as UserRole | undefined;

  // Use live permissions if loaded, otherwise fall back to JWT-cached value
  const sectionPerms: string[] | null =
    livePerms !== undefined ? livePerms : (session?.user?.sectionPermissions ?? null);

  const filtered = visibleTabs(role, sectionPerms);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        {/* Title row */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Hala Krašovská</h1>
            <p className="text-xs text-muted">Projektový management</p>
          </div>
          <UserMenu />
        </div>

        {/* Tab navigation */}
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {filtered.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const href = id && tab.appendQid ? `${tab.href}?id=${id}` : tab.href;

            return (
              <Link
                key={tab.id}
                href={href}
                className={`relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "sklad" && lowStockCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function AppHeader({ activeTab }: { activeTab: string }) {
  return (
    <Suspense
      fallback={
        <header className="no-print sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-lg font-bold text-foreground">Hala Krašovská</h1>
            <p className="text-xs text-muted">Projektový management</p>
          </div>
        </header>
      }
    >
      <HeaderContent activeTab={activeTab} />
    </Suspense>
  );
}
