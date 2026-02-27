"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PlaneLink from "@/components/PlaneLink";
import { PLANE_LINKS } from "@/lib/plane-links";
import KanbanBoard, {
  type KanbanColumn,
  type KanbanIssue,
} from "@/components/plane/KanbanBoard";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface ProjectDetail {
  key: string;
  id: string;
  name: string;
  prefix: string;
  color: string;
  description: string;
  total: number;
  done: number;
  wip: number;
  todo: number;
  progress: number;
  modules: { name: string; status: string }[];
  issues: {
    id: string;
    sequence_id: number;
    name: string;
    state: string;
    target_date: string | null;
    start_date: string | null;
    stateName: string;
    stateGroup: string;
    stateColor: string;
    labelNames: { name: string; color: string }[];
    priority: string | null;
  }[];
}

const COLUMN_CONFIG = [
  {
    group: "unstarted",
    title: "K realizaci",
    color: "#94a3b8",
    icon: Clock,
  },
  {
    group: "started",
    title: "Rozpracováno",
    color: "#f59e0b",
    icon: TrendingUp,
  },
  {
    group: "completed",
    title: "Hotovo",
    color: "#10b981",
    icon: CheckCircle2,
  },
];

function KanbanContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") || "bis";

  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/plane/projects?key=${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMoveIssue = useCallback(
    async (issueId: string, newStateId: string) => {
      if (!data) return;
      setSaving(true);
      try {
        await fetch(
          `/api/plane/issues?project_id=${data.id}&issue_id=${issueId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: newStateId }),
          }
        );
      } catch (err) {
        console.error("Failed to update issue:", err);
      } finally {
        setSaving(false);
      }
    },
    [data]
  );

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Načítání Kanbanu z Plane...
        </div>
      </div>
    );
  }

  // Build columns from issues
  const stateIds = new Map<string, string>();
  for (const issue of data.issues) {
    if (!stateIds.has(issue.stateGroup)) {
      stateIds.set(issue.stateGroup, issue.state);
    }
  }

  // Filter by module — match by target_date range
  let filteredIssues = data.issues;
  if (moduleFilter) {
    const mod = data.modules.find((m) => m.name === moduleFilter);
    if (mod) {
      // We don't have module-issue mapping in API, so filter is display-only hint
      // For now, just show all — module filter is informational
    }
  }

  // Exclude backlog and cancelled from board
  filteredIssues = filteredIssues.filter(
    (i) => i.stateGroup !== "backlog" && i.stateGroup !== "cancelled"
  );

  const columns: KanbanColumn[] = COLUMN_CONFIG.map((cfg) => ({
    id: cfg.group,
    stateId: stateIds.get(cfg.group) || "",
    title: cfg.title,
    group: cfg.group,
    color: cfg.color,
    icon: cfg.icon,
    issues: filteredIssues
      .filter((i) => i.stateGroup === cfg.group)
      .sort((a, b) => a.sequence_id - b.sequence_id)
      .map((i) => ({
        id: i.id,
        sequence_id: i.sequence_id,
        name: i.name,
        target_date: i.target_date,
        stateName: i.stateName,
        stateGroup: i.stateGroup,
        stateId: i.state,
        labelNames: i.labelNames,
        priority: i.priority,
      })),
  }));

  const planeLink = PLANE_LINKS[key as keyof typeof PLANE_LINKS];

  // Project switcher tabs
  const projectKeys = ["bis", "esh", "eos", "sal", "web"];
  const projectNames: Record<string, string> = {
    bis: "Bistro",
    esh: "E-shop",
    eos: "EOS",
    sal: "Salonky",
    web: "Web",
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Link
            href="/projects"
            className="mb-2 flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Projekty
          </Link>
          <h2 className="text-2xl font-bold text-foreground">
            Kanban — {data.name}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {data.total} issues &middot; {data.done} hotovo &middot;{" "}
            {data.wip} rozpracováno &middot; {data.progress}%
            {saving && (
              <span className="ml-2 text-primary">
                <Loader2 className="inline h-3 w-3 animate-spin" /> Ukládání...
              </span>
            )}
          </p>
        </div>
        {planeLink && <PlaneLink href={planeLink} />}
      </div>

      {/* Project tabs */}
      <div className="mb-4 flex gap-1 border-b border-border -mx-4 px-4">
        {projectKeys.map((k) => (
          <Link
            key={k}
            href={`/kanban?key=${k}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              k === key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {projectNames[k]}
          </Link>
        ))}
      </div>

      {/* Kanban */}
      <KanbanBoard
        columns={columns}
        prefix={data.prefix}
        projectId={data.id}
        onMoveIssue={handleMoveIssue}
      />
    </>
  );
}

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="projects" />
      <main className="mx-auto max-w-7xl px-4 py-4">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <KanbanContent />
        </Suspense>
      </main>
    </div>
  );
}
