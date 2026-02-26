"use client";

import { useState } from "react";
import { RecommendedProject } from "@/types";
import CategoryBadge from "./CategoryBadge";
import PriorityBadge from "./PriorityBadge";
import { Check, Loader2, Plus } from "lucide-react";

interface RecommendationListProps {
  recommendations: RecommendedProject[];
  onCreateProject: (rec: RecommendedProject) => Promise<void>;
}

export default function RecommendationList({
  recommendations,
  onCreateProject,
}: RecommendationListProps) {
  const [createdIndexes, setCreatedIndexes] = useState<Set<number>>(new Set());
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleCreate = async (rec: RecommendedProject, index: number) => {
    setLoadingIndex(index);
    try {
      await onCreateProject(rec);
      setCreatedIndexes((prev) => new Set(prev).add(index));
    } finally {
      setLoadingIndex(null);
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Doporučené projekty
      </h2>
      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          const isCreated = createdIndexes.has(i);
          const isLoading = loadingIndex === i;

          return (
            <div
              key={i}
              className="rounded-xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{rec.description}</p>
                </div>
                {isCreated ? (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    <Check className="h-4 w-4" />
                    Vytvořeno
                  </span>
                ) : (
                  <button
                    onClick={() => handleCreate(rec, i)}
                    disabled={isLoading}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Vytvořit projekt
                  </button>
                )}
              </div>
              <div className="mb-3 flex items-center gap-2">
                <CategoryBadge category={rec.category} />
                <PriorityBadge priority={rec.priority} />
              </div>
              {rec.tasks.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted">Úkoly:</p>
                  <ul className="space-y-1">
                    {rec.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
