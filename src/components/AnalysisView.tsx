"use client";

import { AnalysisResult, RecommendedProject } from "@/types";
import MetricCard from "./MetricCard";
import SwotSection from "./SwotSection";
import InsightCard from "./InsightCard";
import RecommendationList from "./RecommendationList";
import { RefreshCw } from "lucide-react";

interface AnalysisViewProps {
  analysis: AnalysisResult;
  onRegenerate: () => void;
  onCreateProject: (rec: RecommendedProject) => Promise<void>;
}

export default function AnalysisView({
  analysis,
  onRegenerate,
  onCreateProject,
}: AnalysisViewProps) {
  return (
    <div className="space-y-8">
      {/* Header with regenerate button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Výsledky analýzy
        </h2>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          <RefreshCw className="h-4 w-4" />
          Přegenerovat
        </button>
      </div>

      {/* Metrics row */}
      {analysis.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {analysis.metrics.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>
      )}

      {/* SWOT grid */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          SWOT analýza
        </h2>
        <SwotSection swot={analysis.swot} />
      </div>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Postřehy
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <RecommendationList
        recommendations={analysis.recommended_projects}
        onCreateProject={onCreateProject}
      />
    </div>
  );
}
