"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import PlaneLink from "@/components/PlaneLink";
import { PLANE_LINKS } from "@/lib/plane-links";
import {
  Loader2,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Target,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Columns3,
} from "lucide-react";

// --- Types ---

interface ModuleData {
  name: string;
  status: string;
  startDate: string | null;
  targetDate: string | null;
}

interface ProjectSummary {
  key: string;
  name: string;
  prefix: string;
  color: string;
  description: string;
  total: number;
  done: number;
  wip: number;
  todo: number;
  progress: number;
  modules: ModuleData[];
  milestones: { seq: number; name: string; targetDate: string | null; state: string }[];
  goals: { seq: number; name: string; targetDate: string | null; state: string }[];
}

interface EnrichedIssue {
  id: string;
  sequence_id: number;
  name: string;
  start_date: string | null;
  target_date: string | null;
  stateName: string;
  stateGroup: string;
  stateColor: string;
  labelNames: { name: string; color: string }[];
  priority: string | null;
}

interface ProjectDetail extends ProjectSummary {
  id: string;
  issues: EnrichedIssue[];
  modules: (ModuleData & { id?: string })[];
}

// --- Helpers ---

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
}

function ProgressBar({ value, color, size = "md" }: { value: number; color: string; size?: "sm" | "md" }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${size === "sm" ? "h-1.5" : "h-2.5"}`}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StateIcon({ group }: { group: string }) {
  if (group === "completed") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (group === "started") return <TrendingUp className="h-4 w-4 text-amber-500" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

// --- Project List View ---

function ProjectListView({
  projects,
  onSelect,
}: {
  projects: ProjectSummary[];
  onSelect: (key: string) => void;
}) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Projekty</h2>
        <p className="mt-1 text-sm text-muted">
          Přehled všech projektů Hala Krašovská z Plane PM
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <button
            key={p.key}
            onClick={() => onSelect(p.key)}
            className="rounded-xl border border-border bg-white p-5 shadow-sm text-left hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.prefix}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted">{p.description}</div>
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: p.color }}>
                {p.progress}%
              </div>
            </div>

            {/* Progress */}
            <ProgressBar value={p.progress} color={p.color} />
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {p.done} hotovo
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-amber-500" />
                {p.wip} rozpracováno
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                {p.todo} čeká
              </span>
            </div>

            {/* Modules */}
            {p.modules.length > 0 && (
              <div className="mt-4 space-y-1">
                {p.modules.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <span className={m.status === "completed" ? "text-green-600" : "text-muted"}>
                      {m.status === "completed" ? "\u2713 " : "\u25CB "}
                      {m.name}
                    </span>
                    {m.targetDate && (
                      <span className="text-muted">{formatDate(m.targetDate)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Milestones preview */}
            {p.milestones.filter((m) => m.state !== "Done").length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="text-xs font-medium text-muted mb-1">
                  <Star className="mr-1 inline h-3 w-3 text-amber-500" />
                  Milníky
                </div>
                {p.milestones
                  .filter((m) => m.state !== "Done")
                  .slice(0, 3)
                  .map((m) => (
                    <div key={m.seq} className="flex items-center justify-between text-xs text-muted">
                      <span className="truncate">{m.name}</span>
                      {m.targetDate && <span>{formatDate(m.targetDate)}</span>}
                    </div>
                  ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

// --- Project Detail View ---

function ProjectDetailView({
  data,
  onBack,
}: {
  data: ProjectDetail;
  onBack: () => void;
}) {
  const [groupBy, setGroupBy] = useState<"status" | "module">("status");
  const [showCompleted, setShowCompleted] = useState(false);

  const planeLink = PLANE_LINKS[data.key as keyof typeof PLANE_LINKS];

  // Group issues
  const grouped: Record<string, EnrichedIssue[]> = {};

  if (groupBy === "status") {
    const order = ["started", "unstarted", "backlog", "completed", "cancelled"];
    const labels: Record<string, string> = {
      started: "Rozpracováno",
      unstarted: "K realizaci",
      backlog: "Backlog",
      completed: "Hotovo",
      cancelled: "Zrušeno",
    };
    for (const issue of data.issues) {
      const g = issue.stateGroup;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(issue);
    }
    // Sort each group by sequence_id
    for (const g of Object.keys(grouped)) {
      grouped[g].sort((a, b) => a.sequence_id - b.sequence_id);
    }

    return (
      <ProjectDetailInner
        data={data}
        onBack={onBack}
        planeLink={planeLink}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      >
        {order.map((g) => {
          const issues = grouped[g];
          if (!issues || issues.length === 0) return null;
          if (g === "completed" && !showCompleted) {
            return (
              <div key={g} className="mb-4">
                <button
                  onClick={() => setShowCompleted(true)}
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                  Hotovo ({issues.length})
                </button>
              </div>
            );
          }
          if (g === "cancelled" && issues.length === 0) return null;

          return (
            <IssueGroup
              key={g}
              title={labels[g] || g}
              issues={issues}
              prefix={data.prefix}
              collapsible={g === "completed"}
              onCollapse={g === "completed" ? () => setShowCompleted(false) : undefined}
            />
          );
        })}
      </ProjectDetailInner>
    );
  }

  // Group by module (not implemented in detail, use status as default)
  return null;
}

function ProjectDetailInner({
  data,
  onBack,
  planeLink,
  groupBy,
  setGroupBy,
  showCompleted,
  setShowCompleted,
  children,
}: {
  data: ProjectDetail;
  onBack: () => void;
  planeLink: string | undefined;
  groupBy: string;
  setGroupBy: (v: "status" | "module") => void;
  showCompleted: boolean;
  setShowCompleted: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na projekty
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: data.color }}
            >
              {data.prefix}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{data.name}</h2>
              <p className="text-sm text-muted">{data.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/kanban?key=${data.key}`}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </Link>
            {planeLink && <PlaneLink href={planeLink} />}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-white p-3 text-center">
          <div className="text-2xl font-bold text-foreground">{data.total}</div>
          <div className="text-xs text-muted">Celkem</div>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{data.done}</div>
          <div className="text-xs text-green-600">Hotovo</div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{data.wip}</div>
          <div className="text-xs text-amber-600">Rozpracováno</div>
        </div>
        <div className="rounded-lg border border-border bg-white p-3 text-center">
          <div className="text-2xl font-bold text-gray-500">{data.todo}</div>
          <div className="text-xs text-muted">Čeká</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Celkový pokrok</span>
          <span className="font-bold" style={{ color: data.color }}>
            {data.progress}%
          </span>
        </div>
        <ProgressBar value={data.progress} color={data.color} />
      </div>

      {/* Modules timeline */}
      {data.modules.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-foreground">Moduly</h3>
          <div className="space-y-2">
            {data.modules.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      m.status === "completed" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                </div>
                <span className="text-xs text-muted">
                  {m.startDate && m.targetDate
                    ? `${formatDate(m.startDate)} — ${formatDate(m.targetDate)}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      <div className="space-y-4">{children}</div>
    </>
  );
}

function IssueGroup({
  title,
  issues,
  prefix,
  collapsible,
  onCollapse,
}: {
  title: string;
  issues: EnrichedIssue[];
  prefix: string;
  collapsible?: boolean;
  onCollapse?: () => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
          {title} ({issues.length})
        </h4>
        {collapsible && onCollapse && (
          <button onClick={onCollapse} className="text-xs text-muted hover:text-foreground">
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="rounded-xl border border-border bg-white shadow-sm divide-y divide-border/50">
        {issues.map((issue) => {
          const type = issue.labelNames.find(
            (l) => l.name === "milestone" || l.name === "goal"
          )?.name;
          return (
            <div key={issue.id} className="flex items-center gap-3 px-4 py-2.5">
              <StateIcon group={issue.stateGroup} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {type === "milestone" && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                  {type === "goal" && <Target className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                  <span className="text-xs text-muted flex-shrink-0">{prefix}-{issue.sequence_id}</span>
                  <span className={`truncate text-sm ${
                    issue.stateGroup === "completed" ? "text-muted line-through" : "font-medium text-foreground"
                  }`}>
                    {issue.name}
                  </span>
                </div>
              </div>
              {issue.target_date && (
                <span className="whitespace-nowrap text-xs text-muted">
                  {formatDate(issue.target_date)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main ---

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialKey = searchParams.get("key");

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(initialKey);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load project list
  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plane/projects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProjects(await res.json());
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load project detail
  const loadDetail = useCallback(async (key: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/plane/projects?key=${key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDetail(await res.json());
    } catch (err) {
      console.error("Failed to load project detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedKey) {
      loadDetail(selectedKey);
    }
  }, [selectedKey, loadDetail]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Načítání projektů z Plane...
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedKey) {
    if (detailLoading || !detail) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Načítání...
          </div>
        </div>
      );
    }
    return (
      <ProjectDetailView
        data={detail}
        onBack={() => {
          setSelectedKey(null);
          setDetail(null);
          // Clean URL
          window.history.replaceState({}, "", "/projects");
        }}
      />
    );
  }

  // List view
  return (
    <ProjectListView
      projects={projects}
      onSelect={(key) => {
        setSelectedKey(key);
        window.history.pushState({}, "", `/projects?key=${key}`);
      }}
    />
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="projects" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <ProjectsContent />
        </Suspense>
      </main>
    </div>
  );
}
