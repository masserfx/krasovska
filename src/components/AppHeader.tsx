"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  ClipboardList,
  Shield,
  ShoppingCart,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";

const STORAGE_KEY = "hala-krasovska-active-qid";

const tabs = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projekty", href: "/projects", icon: FolderKanban },
  { id: "analysis", label: "Analýza", href: "/analysis", icon: BarChart3 },
  { id: "questionnaire", label: "Dotazník", href: "/", icon: ClipboardList },
  { id: "audit", label: "Audit", href: "/audit", icon: Shield },
  { id: "eshop", label: "E-shop", href: "/eshop", icon: ShoppingCart },
] as const;

type TabId = (typeof tabs)[number]["id"];

function HeaderContent({ activeTab }: { activeTab: TabId }) {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const [id, setId] = useState(idFromUrl);

  useEffect(() => {
    if (idFromUrl) {
      setId(idFromUrl);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setId(stored);
  }, [idFromUrl]);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        {/* Title row */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Hala Krašovská
            </h1>
            <p className="text-xs text-muted">Projektový management</p>
          </div>
          <UserMenu />
        </div>

        {/* Tab navigation */}
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const href = id ? `${tab.href}?id=${id}` : tab.href;

            return (
              <Link
                key={tab.id}
                href={href}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function AppHeader({ activeTab }: { activeTab: TabId }) {
  return (
    <Suspense
      fallback={
        <header className="no-print sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <h1 className="text-lg font-bold text-foreground">
              Hala Krašovská
            </h1>
            <p className="text-xs text-muted">Projektový management</p>
          </div>
        </header>
      }
    >
      <HeaderContent activeTab={activeTab} />
    </Suspense>
  );
}
