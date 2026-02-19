"use client";

import { useEffect, useState, useRef } from "react";

interface KpiRow {
  id: string;
  month_year: string;
  revenue_target: number;
  revenue_actual: number | null;
  covers_target: number;
  covers_actual: number | null;
  avg_ticket_target: number;
  avg_ticket_actual: number | null;
  fixed_costs: number;
  variable_costs_actual: number | null;
}

const MONTH_LABELS: Record<string, string> = {
  "2026-02": "Únor",
  "2026-03": "Březen",
  "2026-04": "Duben",
  "2026-05": "Květen",
  "2026-06": "Červen",
  "2026-07": "Červenec",
  "2026-08": "Srpen",
  "2026-09": "Září",
  "2026-10": "Říjen",
  "2026-11": "Listopad",
  "2026-12": "Prosinec",
};

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "–";
  return value.toLocaleString("cs-CZ") + " Kč";
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "–";
  return value.toLocaleString("cs-CZ");
}

function EditableCell({
  value,
  field,
  monthYear,
  format,
  onSave,
}: {
  value: number | null;
  field: string;
  monthYear: string;
  format: "currency" | "number";
  onSave: (monthYear: string, field: string, value: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setInputValue(value !== null ? String(value) : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function save() {
    setEditing(false);
    const num = parseFloat(inputValue);
    if (isNaN(num)) return;
    await onSave(monthYear, field, num);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-full rounded border border-primary bg-white px-2 py-1 text-sm text-foreground"
      />
    );
  }

  const display =
    format === "currency" ? formatCurrency(value) : formatNumber(value);

  return (
    <button
      onClick={startEdit}
      className="w-full text-right hover:bg-blue-50 rounded px-2 py-1 text-sm cursor-pointer transition-colors"
      title="Klikněte pro úpravu"
    >
      {display}
    </button>
  );
}

export default function ControllingDashboard() {
  const [kpis, setKpis] = useState<KpiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bistro/kpis");
        if (!res.ok) throw new Error("Nepodařilo se načíst KPI data");
        setKpis(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chyba při načítání");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(monthYear: string, field: string, value: number) {
    // Optimistic update
    setKpis((prev) =>
      prev.map((k) => (k.month_year === monthYear ? { ...k, [field]: value } : k))
    );

    try {
      const res = await fetch("/api/bistro/kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month_year: monthYear, [field]: value }),
      });
      if (!res.ok) throw new Error("Nepodařilo se uložit");
    } catch {
      // Reload on error
      const res = await fetch("/api/bistro/kpis");
      if (res.ok) setKpis(await res.json());
    }
  }

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

  const sortedKpis = [...kpis].sort((a, b) => a.month_year.localeCompare(b.month_year));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-background">
            <th className="p-3 text-left text-xs font-semibold text-muted">Měsíc</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Plán tržby</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Skut. tržby</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Plán pokryvů</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Skut. pokryvů</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Prům. ticket</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Break-even</th>
            <th className="p-3 text-right text-xs font-semibold text-muted">Delta</th>
          </tr>
        </thead>
        <tbody>
          {sortedKpis.map((kpi) => {
            const delta =
              kpi.revenue_actual !== null
                ? kpi.revenue_actual - kpi.revenue_target
                : null;
            const deltaColor =
              delta !== null
                ? delta >= 0
                  ? "text-green-600"
                  : "text-red-600"
                : "text-muted";
            const revenueColor =
              kpi.revenue_actual !== null
                ? kpi.revenue_actual >= kpi.revenue_target
                  ? "text-green-600"
                  : "text-red-600"
                : "";
            const breakEvenPct =
              kpi.fixed_costs > 0 && kpi.revenue_actual !== null
                ? Math.min(
                    Math.round((kpi.revenue_actual / kpi.fixed_costs) * 100),
                    100
                  )
                : 0;

            return (
              <tr
                key={kpi.id}
                className="border-b border-border hover:bg-background/50"
              >
                <td className="p-3 text-sm font-medium text-foreground">
                  {MONTH_LABELS[kpi.month_year] ?? kpi.month_year}
                </td>
                <td className="p-3 text-right text-sm text-foreground">
                  {formatCurrency(kpi.revenue_target)}
                </td>
                <td className={`p-3 ${revenueColor}`}>
                  <EditableCell
                    value={kpi.revenue_actual}
                    field="revenue_actual"
                    monthYear={kpi.month_year}
                    format="currency"
                    onSave={handleSave}
                  />
                </td>
                <td className="p-3 text-right text-sm text-foreground">
                  {formatNumber(kpi.covers_target)}
                </td>
                <td className="p-3">
                  <EditableCell
                    value={kpi.covers_actual}
                    field="covers_actual"
                    monthYear={kpi.month_year}
                    format="number"
                    onSave={handleSave}
                  />
                </td>
                <td className="p-3">
                  <EditableCell
                    value={kpi.avg_ticket_actual}
                    field="avg_ticket_actual"
                    monthYear={kpi.month_year}
                    format="currency"
                    onSave={handleSave}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${breakEvenPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{breakEvenPct}%</span>
                  </div>
                </td>
                <td
                  className={`p-3 text-right text-sm font-medium ${deltaColor}`}
                >
                  {delta !== null
                    ? `${delta >= 0 ? "+" : ""}${formatCurrency(delta)}`
                    : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
