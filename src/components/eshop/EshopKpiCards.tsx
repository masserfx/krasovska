"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  Trophy,
  Loader2,
} from "lucide-react";
import { DashboardData, fetchDashboard } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";

const ANNUAL_TARGET = 35_000_000; // 350 000 Kč in halere

export default function EshopKpiCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  if (!data) return null;

  const yearProgress = Math.min((data.revenue.year / ANNUAL_TARGET) * 100, 100);

  return (
    <div className="mb-6 space-y-4">
      {/* Revenue cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RevenueCard label="Dnes" value={data.revenue.today} icon={<TrendingUp className="h-4 w-4" />} />
        <RevenueCard label="Tento týden" value={data.revenue.week} icon={<TrendingUp className="h-4 w-4" />} />
        <RevenueCard label="Tento měsíc" value={data.revenue.month} icon={<TrendingUp className="h-4 w-4" />} />
        <RevenueCard label="Letos" value={data.revenue.year} icon={<TrendingUp className="h-4 w-4" />} highlight />
      </div>

      {/* Progress bar + stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Annual progress */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:col-span-2">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Roční cíl: {formatPrice(ANNUAL_TARGET)}</span>
            <span className="font-bold text-primary">{yearProgress.toFixed(1)} %</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${yearProgress}%` }}
            />
          </div>
          {/* Mini chart — daily revenue */}
          {data.daily_revenue.length > 0 && (
            <div className="mt-3 flex items-end gap-1" style={{ height: 48 }}>
              {data.daily_revenue.map((d) => {
                const max = Math.max(...data.daily_revenue.map((r) => r.revenue), 1);
                const h = Math.max((d.revenue / max) * 100, 4);
                return (
                  <div key={d.day} className="group relative flex-1">
                    <div
                      className="w-full rounded-t bg-primary/20 transition-colors group-hover:bg-primary/40"
                      style={{ height: `${h}%` }}
                    />
                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] text-white group-hover:block">
                      {formatPrice(d.revenue)} · {d.orders} obj.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending orders + today count */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted">
              <ShoppingCart className="h-4 w-4" />
              Dnes objednávek
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">{data.orders_today}</div>
          </div>
          {data.pending.total > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Clock className="h-4 w-4" />
                Čekající
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-amber-700">{data.pending.total}</span>
                <span className="text-xs text-amber-600">
                  {data.pending.paid > 0 && `${data.pending.paid} zaplaceno`}
                  {data.pending.preparing > 0 && ` · ${data.pending.preparing} příprava`}
                  {data.pending.ready > 0 && ` · ${data.pending.ready} k vydání`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      {data.top_products.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Trophy className="h-4 w-4 text-amber-500" />
            Top produkty tento měsíc
          </div>
          <div className="space-y-2">
            {data.top_products.map((p, i) => {
              const maxQty = data.top_products[0].qty;
              const w = Math.max((p.qty / maxQty) * 100, 8);
              return (
                <div key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-right font-mono text-xs text-muted">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium text-foreground">{p.name}</span>
                      <span className="ml-2 whitespace-nowrap text-xs text-muted">
                        {p.qty} ks · {formatPrice(p.revenue)}
                      </span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-muted">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {formatPrice(value)}
      </div>
    </div>
  );
}
