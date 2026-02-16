"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardData } from "@/types";
import { fetchDashboard } from "@/lib/api";
import AppHeader from "@/components/AppHeader";
import DashboardStats from "@/components/DashboardStats";
import ProjectsOverview from "@/components/ProjectsOverview";
import InsightsList from "@/components/InsightsList";
import EmptyState from "@/components/EmptyState";
import { Loader2, LayoutDashboard } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst dashboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!id) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Chybí identifikátor dotazníku"
        description="Pro zobrazení dashboardu je potřeba platný dotazník."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Načítání dashboardu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Chyba při načítání"
        description={error}
        action={{ label: "Zkusit znovu", onClick: loadData }}
      />
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <DashboardStats stats={data.stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectsOverview
          projects_by_category={data.projects_by_category}
          recent_projects={data.recent_projects}
        />
        <InsightsList insights={data.insights} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="dashboard" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
