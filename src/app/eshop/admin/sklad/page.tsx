"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Download,
  Package,
  CheckCircle2,
} from "lucide-react";
import { PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types/eshop";
import { fetchStock, StockData } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";

function SkladContent() {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchStock());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function exportCsv() {
    if (!data) return;
    const rows = data.products
      .filter((p) => p.is_active && p.stock_quantity <= p.low_stock_threshold)
      .map((p) => [
        p.name,
        PRODUCT_CATEGORY_LABELS[p.category as ProductCategory] || p.category,
        p.stock_quantity,
        p.low_stock_threshold,
        Math.round(p.price_czk / 100),
      ]);

    const header = "Produkt;Kategorie;Skladem;Minimum;Cena Kč";
    const csv = [header, ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sklad-pod-minimem-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!data) return null;

  const filtered =
    filter === "low"
      ? data.products.filter(
          (p) => p.is_active && p.stock_quantity <= p.low_stock_threshold
        )
      : data.products;

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sklad</h2>
          <p className="text-sm text-muted">
            Přehled stavu zásob —{" "}
            {data.low_stock_count > 0 ? (
              <span className="font-medium text-danger">
                {data.low_stock_count}{" "}
                {data.low_stock_count === 1
                  ? "produkt pod minimem"
                  : data.low_stock_count < 5
                    ? "produkty pod minimem"
                    : "produktů pod minimem"}
              </span>
            ) : (
              <span className="text-success">vše v pořádku</span>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={data.low_stock_count === 0}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-foreground">
            {data.products.filter((p) => p.is_active).length}
          </div>
          <div className="text-sm text-muted">Aktivních produktů</div>
        </div>
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            data.low_stock_count > 0
              ? "border-danger/30 bg-danger/5"
              : "border-success/30 bg-success/5"
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              data.low_stock_count > 0 ? "text-danger" : "text-success"
            }`}
          >
            {data.low_stock_count}
          </div>
          <div className="text-sm text-muted">Pod minimem</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-foreground">
            {data.products
              .filter((p) => p.is_active && p.stock_quantity === 0)
              .length}
          </div>
          <div className="text-sm text-muted">Vyprodáno</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-background text-muted hover:text-foreground"
          }`}
        >
          Vše ({data.products.length})
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "low"
              ? "bg-danger text-white"
              : "bg-background text-muted hover:text-foreground"
          }`}
        >
          Pod minimem ({data.low_stock_count})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-muted">Produkt</th>
                <th className="px-4 py-3 font-medium text-muted">Kategorie</th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Skladem
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Minimum
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Cena
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted">
                  Stav
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isLow =
                  p.is_active && p.stock_quantity <= p.low_stock_threshold;
                const isOut = p.stock_quantity === 0;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-border last:border-b-0 ${
                      isOut
                        ? "bg-red-50"
                        : isLow
                          ? "bg-amber-50"
                          : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.name}</div>
                      {!p.is_active && (
                        <span className="text-xs text-muted">(neaktivní)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {PRODUCT_CATEGORY_LABELS[p.category as ProductCategory] ||
                        p.category}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium ${
                        isOut
                          ? "text-danger"
                          : isLow
                            ? "text-amber-600"
                            : "text-foreground"
                      }`}
                    >
                      {p.stock_quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {p.low_stock_threshold}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {formatPrice(p.price_czk)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <Package className="h-3 w-3" />
                          Vyprodáno
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Doplnit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    Žádné produkty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function SkladPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="eshop-admin" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <SkladContent />
        </Suspense>
      </main>
    </div>
  );
}
