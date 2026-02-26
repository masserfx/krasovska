"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import PlaneLink from "@/components/PlaneLink";
import {
  Loader2,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  Star,
  Target,
  Calendar,
  ArrowRight,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

interface ProjectData {
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
  modules: { name: string; status: string; startDate: string | null; targetDate: string | null }[];
  milestones: { seq: number; name: string; targetDate: string | null; state: string }[];
  goals: { seq: number; name: string; targetDate: string | null; state: string }[];
  upcoming: { seq: number; name: string; targetDate: string; type: string; state: string; stateGroup: string }[];
}

interface DashboardData {
  projects: ProjectData[];
  totals: { issues: number; done: number; wip: number; todo: number; progress: number };
  upcoming: (ProjectData["upcoming"][number] & { project: string; prefix: string })[];
  milestones: (ProjectData["milestones"][number] & { project: string; prefix: string })[];
}

const CALENDAR_URL =
  "http://46.225.31.161:5555/calendar/krasovska.ics?token=gtQLkawoAcZyRj8X9QrpZo9JHQs7hyN9-q4BmwrUKTI";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color + "15", color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-muted">{sub}</div>}
    </div>
  );
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plane/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se načíst data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Načítání z Plane...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LayoutDashboard className="mx-auto mb-3 h-10 w-10 text-muted/40" />
          <p className="mb-2 text-sm font-medium text-foreground">
            {error || "Žádná data"}
          </p>
          <button onClick={load} className="text-sm text-primary hover:underline">
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  const { totals, projects, upcoming, milestones } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="mt-1 text-sm text-muted">
            Přehled všech projektů Hala Krašovská
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={CALENDAR_URL}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-background transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Kalendář .ics
          </a>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="Celkem issues"
          value={totals.issues}
          color="#6366f1"
        />
        <StatCard
          icon={CheckCircle2}
          label="Hotovo"
          value={totals.done}
          sub={`${totals.progress}% celkový pokrok`}
          color="#10b981"
        />
        <StatCard
          icon={TrendingUp}
          label="Rozpracováno"
          value={totals.wip}
          color="#f59e0b"
        />
        <StatCard
          icon={Clock}
          label="Čeká"
          value={totals.todo}
          color="#94a3b8"
        />
      </div>

      {/* Projects */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Projekty</h3>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Všechny projekty
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.key}
              href={`/projects?key=${p.key}`}
              className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted">{p.prefix}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: p.color }}>
                  {p.progress}%
                </span>
              </div>
              <ProgressBar value={p.progress} color={p.color} />
              <div className="mt-2 flex gap-4 text-xs text-muted">
                <span>{p.done} hotovo</span>
                <span>{p.wip} rozpracováno</span>
                <span>{p.todo} čeká</span>
              </div>
              {p.modules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.modules.map((m) => (
                    <span
                      key={m.name}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        m.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {m.status === "completed" ? "\u2713 " : ""}{m.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row: Upcoming + Milestones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming deadlines */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-amber-500" />
            Nadcházející termíny (14 dní)
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">Žádné blízké termíny</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 10).map((u, i) => (
                <div
                  key={`${u.prefix}-${u.seq}-${i}`}
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {u.type === "milestone" && <Star className="mr-1 inline h-3 w-3 text-amber-500" />}
                      {u.type === "goal" && <Target className="mr-1 inline h-3 w-3 text-blue-500" />}
                      {u.prefix}-{u.seq}: {u.name}
                    </div>
                    <div className="text-xs text-muted">{u.project}</div>
                  </div>
                  <div className="ml-3 whitespace-nowrap text-xs font-medium text-muted">
                    {formatDate(u.targetDate)}
                  </div>
                </div>
              ))}
              {upcoming.length > 10 && (
                <p className="text-xs text-muted">
                  + {upcoming.length - 10} dalších
                </p>
              )}
            </div>
          )}
        </div>

        {/* Milestones & Calendar */}
        <div className="space-y-4">
          {/* Milestones */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Star className="h-4 w-4 text-amber-500" />
              Milníky
            </h3>
            <div className="space-y-2">
              {milestones
                .filter((m) => m.state !== "Done")
                .slice(0, 6)
                .map((m, i) => (
                  <div
                    key={`ms-${m.prefix}-${m.seq}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-background px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {m.name}
                      </div>
                      <div className="text-xs text-muted">{m.project}</div>
                    </div>
                    <div className="ml-3 whitespace-nowrap text-xs font-medium text-muted">
                      {m.targetDate ? formatDate(m.targetDate) : "—"}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Calendar integration */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
              <Calendar className="h-4 w-4" />
              Apple Calendar
            </h3>
            <p className="mb-3 text-sm text-amber-800">
              Odebírejte .ics feed pro synchronizaci všech termínů, milníků
              a modulů do Apple Calendar, Google Calendar nebo Outlooku.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={CALENDAR_URL}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-amber-900 font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(CALENDAR_URL)}
                className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Kopírovat
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-700">
              162 událostí &middot; 13 modulů &middot; aktualizace každých 15 min
            </p>
          </div>
        </div>
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
