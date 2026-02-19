"use client";

import { useEffect, useState } from "react";

interface BistroPhase {
  id: string;
  title: string;
  phase_number: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface BistroTask {
  id: string;
  phase_id: string;
  title: string;
  status: string;
}

const MONTHS = [
  { key: "2026-02", label: "Únor" },
  { key: "2026-03", label: "Březen" },
  { key: "2026-04", label: "Duben" },
  { key: "2026-05", label: "Květen" },
  { key: "2026-06", label: "Červen" },
  { key: "2026-07", label: "Červenec" },
  { key: "2026-08", label: "Srpen" },
  { key: "2026-09", label: "Září" },
];

const PHASE_COLORS = [
  { bg: "bg-blue-200", bar: "bg-blue-500", text: "text-blue-800" },
  { bg: "bg-green-200", bar: "bg-green-500", text: "text-green-800" },
  { bg: "bg-yellow-200", bar: "bg-yellow-500", text: "text-yellow-800" },
  { bg: "bg-purple-200", bar: "bg-purple-500", text: "text-purple-800" },
];

function getMonthIndex(dateStr: string): number {
  const month = dateStr.slice(0, 7); // "YYYY-MM"
  const idx = MONTHS.findIndex((m) => m.key === month);
  return idx >= 0 ? idx : dateStr < MONTHS[0].key ? 0 : MONTHS.length - 1;
}

export default function GanttChart() {
  const [phases, setPhases] = useState<BistroPhase[]>([]);
  const [tasks, setTasks] = useState<BistroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch("/api/bistro/phases"),
          fetch("/api/bistro/tasks"),
        ]);
        if (!pRes.ok || !tRes.ok) throw new Error("Nepodařilo se načíst data");
        setPhases(await pRes.json());
        setTasks(await tRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chyba při načítání");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger bg-red-50 p-4 text-center text-sm text-danger">
        {error}
      </div>
    );
  }

  const sortedPhases = [...phases].sort(
    (a, b) => a.phase_number - b.phase_number
  );

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div
        className="grid gap-px min-w-[700px]"
        style={{
          gridTemplateColumns: `180px repeat(${MONTHS.length}, 1fr)`,
        }}
      >
        <div className="p-2 text-xs font-semibold text-muted bg-background rounded-tl-lg">
          Fáze
        </div>
        {MONTHS.map((m) => (
          <div
            key={m.key}
            className="p-2 text-xs font-semibold text-muted text-center bg-background"
          >
            {m.label}
          </div>
        ))}

        {/* Phase rows */}
        {sortedPhases.map((phase, idx) => {
          const color = PHASE_COLORS[idx % PHASE_COLORS.length];
          const startCol = getMonthIndex(phase.start_date) + 2; // +2 because grid col 1 is the name
          const endCol = getMonthIndex(phase.end_date) + 3; // +3 for inclusive end
          const phaseTasks = tasks.filter((t) => t.phase_id === phase.id);

          return (
            <div key={phase.id} className="contents">
              {/* Phase name */}
              <div className="p-2 border-t border-border">
                <span className={`text-sm font-medium ${color.text}`}>
                  {phase.title}
                </span>
                {/* Tasks list */}
                {phaseTasks.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {phaseTasks.map((t) => (
                      <li key={t.id} className="text-xs text-muted truncate">
                        {t.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Timeline cells */}
              {MONTHS.map((m, mIdx) => {
                const colIdx = mIdx + 2;
                const isInRange = colIdx >= startCol && colIdx < endCol;

                return (
                  <div
                    key={m.key}
                    className="relative border-t border-border p-1 min-h-[48px]"
                    onMouseEnter={() =>
                      isInRange ? setHoveredPhase(phase.id) : undefined
                    }
                    onMouseLeave={() => setHoveredPhase(null)}
                  >
                    {isInRange && (
                      <div
                        className={`h-6 rounded ${color.bar} opacity-80`}
                      />
                    )}
                    {/* Tooltip */}
                    {isInRange && hoveredPhase === phase.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-1 w-48 rounded-lg border border-border bg-white p-2 shadow-lg text-xs">
                        <p className="font-semibold text-foreground">
                          {phase.title}
                        </p>
                        <p className="text-muted">
                          {new Date(phase.start_date).toLocaleDateString(
                            "cs-CZ"
                          )}{" "}
                          –{" "}
                          {new Date(phase.end_date).toLocaleDateString("cs-CZ")}
                        </p>
                        <p className="text-muted mt-0.5">
                          Status: {phase.status}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
