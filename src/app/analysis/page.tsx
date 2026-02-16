"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalysisResult, RecommendedProject } from "@/types";
import {
  fetchAnalysis,
  regenerateAnalysis,
  createProject,
} from "@/lib/api";
import AppHeader from "@/components/AppHeader";
import AnalysisView from "@/components/AnalysisView";
import EmptyState from "@/components/EmptyState";
import { Loader2, BarChart3 } from "lucide-react";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const snapshot = await fetchAnalysis(id);
      setAnalysis(snapshot.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst analýzu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegenerate = useCallback(async () => {
    if (!id) return;
    setRegenerating(true);
    try {
      const snapshot = await regenerateAnalysis(id);
      setAnalysis(snapshot.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se přegenerovat analýzu");
    } finally {
      setRegenerating(false);
    }
  }, [id]);

  const handleCreateProject = useCallback(
    async (rec: RecommendedProject) => {
      await createProject({
        questionnaire_id: id,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        status: "planned",
        priority: rec.priority,
        due_date: null,
      });
    },
    [id]
  );

  if (!id) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Chybí identifikátor dotazníku"
        description="Pro zobrazení analýzy je potřeba platný dotazník."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Načítání analýzy...
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Analýza není k dispozici"
        description={error}
        action={{ label: "Vygenerovat analýzu", onClick: handleRegenerate }}
      />
    );
  }

  if (!analysis) return null;

  return (
    <>
      {regenerating && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generování nové analýzy...
        </div>
      )}
      <AnalysisView
        analysis={analysis}
        onRegenerate={handleRegenerate}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="analysis" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <AnalysisContent />
        </Suspense>
      </main>
    </div>
  );
}
