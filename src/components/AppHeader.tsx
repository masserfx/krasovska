"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
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
  ScanLine,
  ChevronDown,
  Settings,
  type LucideIcon,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/types/auth";

const STORAGE_KEY = "hala-krasovska-active-qid";

/* ─── Tab & group definitions ─── */

interface TabDef {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  minRole?: UserRole;
  appendQid?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: TabDef[];
}

const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minRole: "member", appendQid: true },
    ],
  },
  {
    id: "project",
    label: "Projekty",
    icon: FolderKanban,
    items: [
      { id: "projects",      label: "Projekty", href: "/projects", icon: FolderKanban, minRole: "member" },
      { id: "questionnaire", label: "Dotazník", href: "/",         icon: ClipboardList, minRole: "member", appendQid: true },
      { id: "analysis",      label: "Analýza",  href: "/analysis", icon: BarChart3,     minRole: "admin",  appendQid: true },
    ],
  },
  {
    id: "operations",
    label: "Provoz",
    icon: UtensilsCrossed,
    items: [
      { id: "bistro", label: "Bistro", href: "/bistro", icon: UtensilsCrossed, minRole: "member" },
      { id: "eshop",  label: "E-shop", href: "/eshop",  icon: ShoppingCart },
    ],
  },
  {
    id: "eshop-mgmt",
    label: "E-shop správa",
    icon: Receipt,
    items: [
      { id: "objednavky", label: "Objednávky", href: "/eshop/admin/objednavky", icon: Receipt,   minRole: "reception" },
      { id: "eshop-admin", label: "Produkty",  href: "/eshop/admin",            icon: Package,   minRole: "admin" },
      { id: "sklad",       label: "Sklad",     href: "/eshop/admin/sklad",      icon: Warehouse, minRole: "reception" },
    ],
  },
  {
    id: "admin",
    label: "Správa",
    icon: Settings,
    items: [
      { id: "users",    label: "Uživatelé", href: "/users",    icon: Users,    minRole: "admin" },
      { id: "sessions", label: "Relace",    href: "/sessions", icon: FileText, minRole: "admin" },
      { id: "audit",    label: "Audit",     href: "/audit",    icon: Shield,   minRole: "admin" },
      { id: "eos",      label: "EOS",       href: "/eos",      icon: ScanLine, minRole: "admin" },
    ],
  },
];

/* ─── Visibility filter ─── */

function visibleGroups(role: UserRole | undefined, sectionPerms: string[] | null): NavGroup[] {
  return navGroups
    .map((group) => {
      const items = group.items.filter((t) => {
        if (!t.minRole) return true;
        if (!role) return false;
        if (role === "admin") return true;
        if (sectionPerms !== null) return sectionPerms.includes(t.id);
        return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[t.minRole];
      });
      return items.length > 0 ? { ...group, items } : null;
    })
    .filter((g): g is NavGroup => g !== null);
}

/* ─── Dropdown component ─── */

function NavDropdown({
  group,
  activeTab,
  qid,
  lowStockCount,
}: {
  group: NavGroup;
  activeTab: string;
  qid: string | null;
  lowStockCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  const hasActive = group.items.some((t) => t.id === activeTab);
  const GroupIcon = group.icon;

  // Single-item group → render as direct link
  if (group.items.length === 1) {
    const tab = group.items[0];
    const Icon = tab.icon;
    const href = qid && tab.appendQid ? `${tab.href}?id=${qid}` : tab.href;
    const isActive = tab.id === activeTab;

    return (
      <Link
        href={href}
        className={`relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-muted hover:border-border hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        {tab.label}
      </Link>
    );
  }

  // Multi-item group → dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
          hasActive
            ? "border-primary text-primary"
            : "border-transparent text-muted hover:border-border hover:text-foreground"
        }`}
      >
        <GroupIcon className="h-4 w-4" />
        {group.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        {/* Badge for stock alerts in eshop-mgmt group */}
        {group.id === "eshop-mgmt" && lowStockCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {lowStockCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-px min-w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
          {group.items.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const href = qid && tab.appendQid ? `${tab.href}?id=${qid}` : tab.href;

            return (
              <Link
                key={tab.id}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/5 font-medium text-primary"
                    : "text-foreground hover:bg-background"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
                {tab.id === "sklad" && lowStockCount > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Header content ─── */

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

  const groups = visibleGroups(role, sectionPerms);

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

        {/* Navigation */}
        <nav className="-mb-px flex gap-0.5">
          {groups.map((group) => (
            <NavDropdown
              key={group.id}
              group={group}
              activeTab={activeTab}
              qid={id}
              lowStockCount={lowStockCount}
            />
          ))}
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
