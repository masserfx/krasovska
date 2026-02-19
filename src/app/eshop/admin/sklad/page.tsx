"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Download,
  Package,
  CheckCircle2,
  Minus,
  Plus,
  Tags,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
} from "lucide-react";
import {
  fetchStock,
  StockData,
  updateStock,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CategoryData,
} from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import { generateSlug } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";

/* ─── Inline editable cell ─── */

function InlineEdit({
  value,
  onSave,
  suffix,
  min = 0,
  className = "",
}: {
  value: number;
  onSave: (v: number) => void;
  suffix?: string;
  min?: number;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  function commit() {
    const n = Math.max(min, parseInt(draft) || 0);
    setEditing(false);
    if (n !== value) onSave(n);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`rounded px-2 py-1 text-right font-mono tabular-nums hover:bg-primary/5 hover:text-primary transition-colors ${className}`}
      >
        {value}{suffix && <span className="ml-0.5 text-xs text-muted font-normal">{suffix}</span>}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      min={min}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-20 rounded border border-primary bg-primary/5 px-2 py-1 text-right font-mono text-sm focus:outline-none"
    />
  );
}

/* ─── Adjustment buttons ─── */

function AdjustButtons({
  onAdjust,
  saving,
}: {
  onAdjust: (delta: number) => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onAdjust(-1)}
        disabled={saving}
        className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
        title="-1"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onAdjust(1)}
        disabled={saving}
        className="rounded p-1 text-muted hover:bg-green-50 hover:text-green-600 disabled:opacity-30"
        title="+1"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Stock level bar (Shopify-style) ─── */

function StockBar({ quantity, threshold }: { quantity: number; threshold: number }) {
  const max = Math.max(threshold * 3, quantity, 1);
  const pct = Math.min((quantity / max) * 100, 100);
  const color =
    quantity === 0
      ? "bg-red-500"
      : quantity <= threshold
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Category manager ─── */

function CategoryManager({
  categories,
  onRefresh,
}: {
  categories: CategoryData[];
  onRefresh: () => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!newLabel.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createCategory(generateSlug(newLabel), newLabel.trim());
      setNewLabel("");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(slug: string) {
    if (!editLabel.trim()) return;
    setSaving(true);
    try {
      await updateCategory(slug, { label: editLabel.trim() });
      setEditingId(null);
      onRefresh();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Smazat kategorii? Nelze smazat kategorii s produkty.")) return;
    setError("");
    try {
      await deleteCategory(slug);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <Tags className="h-4 w-4" />
        Kategorie produktů
      </h3>

      {error && (
        <div className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
      )}

      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-background"
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(cat.slug);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 rounded border border-primary bg-primary/5 px-2 py-1 text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleRename(cat.slug)}
                  disabled={saving}
                  className="rounded p-1 text-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded p-1 text-muted hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-foreground">{cat.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                  {cat.product_count}
                </span>
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditLabel(cat.label);
                  }}
                  className="rounded p-1 text-muted hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {cat.product_count === 0 && (
                  <button
                    onClick={() => handleDelete(cat.slug)}
                    className="rounded p-1 text-muted hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nová kategorie..."
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newLabel.trim()}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main sklad content ─── */

function SkladContent() {
  const [data, setData] = useState<StockData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stockData, catData] = await Promise.all([fetchStock(), fetchCategories()]);
      setData(stockData);
      setCategories(catData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.label]));

  async function handleStockUpdate(
    id: string,
    update: { stock_quantity?: number; stock_delta?: number; low_stock_threshold?: number }
  ) {
    setSavingIds((prev) => new Set(prev).add(id));
    try {
      const updated = await updateStock(id, update);
      // Update local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((p) =>
                p.id === id
                  ? { ...p, stock_quantity: updated.stock_quantity, low_stock_threshold: updated.low_stock_threshold }
                  : p
              ),
              low_stock_count: prev.products.filter((p) => {
                const pp = p.id === id ? { ...p, stock_quantity: updated.stock_quantity, low_stock_threshold: updated.low_stock_threshold } : p;
                return pp.is_active && pp.stock_quantity <= pp.low_stock_threshold;
              }).length,
            }
          : prev
      );
    } catch {
      // silent
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function exportCsv() {
    if (!data) return;
    const rows = data.products
      .filter((p) => p.is_active && p.stock_quantity <= p.low_stock_threshold)
      .map((p) => [
        p.name,
        catMap[p.category] || p.category,
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

  // Apply filters
  let filtered = data.products;

  if (filter === "low") {
    filtered = filtered.filter(
      (p) => p.is_active && p.stock_quantity <= p.low_stock_threshold
    );
  }
  if (categoryFilter !== "all") {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main column */}
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sklad</h2>
            <p className="text-sm text-muted">
              {data.low_stock_count > 0 ? (
                <span className="font-medium text-danger">
                  {data.low_stock_count} pod minimem
                </span>
              ) : (
                <span className="text-success">Vše v pořádku</span>
              )}
              {" · "}{data.products.filter((p) => p.is_active).length} aktivních produktů
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-background lg:hidden"
            >
              <Tags className="h-4 w-4" />
            </button>
            <button
              onClick={exportCsv}
              disabled={data.low_stock_count === 0}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-background disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-foreground">
              {data.products.filter((p) => p.is_active).length}
            </div>
            <div className="text-xs text-muted">Aktivní</div>
          </div>
          <div
            className={`rounded-xl border p-3 shadow-sm ${
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
            <div className="text-xs text-muted">Pod minimem</div>
          </div>
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-foreground">
              {data.products.filter((p) => p.is_active && p.stock_quantity === 0).length}
            </div>
            <div className="text-xs text-muted">Vyprodáno</div>
          </div>
        </div>

        {/* Filters row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-background text-muted hover:text-foreground"
            }`}
          >
            Vše
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "low"
                ? "bg-danger text-white"
                : "bg-background text-muted hover:text-foreground"
            }`}
          >
            Pod minimem
          </button>

          <span className="mx-1 h-4 w-px bg-border" />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">Všechny kategorie</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label} ({c.product_count})
              </option>
            ))}
          </select>

          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat..."
              className="rounded-full border border-border bg-white py-1.5 pl-8 pr-3 text-xs focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Inventory table */}
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs">
                  <th className="px-4 py-3 font-medium text-muted">Produkt</th>
                  <th className="px-4 py-3 font-medium text-muted">Kategorie</th>
                  <th className="px-2 py-3 text-center font-medium text-muted">Stav</th>
                  <th className="px-2 py-3 text-right font-medium text-muted">
                    Skladem
                  </th>
                  <th className="px-1 py-3" />
                  <th className="px-2 py-3 text-right font-medium text-muted">
                    Minimum
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Cena</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isLow =
                    p.is_active && p.stock_quantity <= p.low_stock_threshold;
                  const isOut = p.stock_quantity === 0;
                  const isSaving = savingIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-border/50 last:border-b-0 transition-colors ${
                        isOut
                          ? "bg-red-50/50"
                          : isLow
                            ? "bg-amber-50/50"
                            : "hover:bg-gray-50/50"
                      } ${isSaving ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{p.name}</div>
                        {!p.is_active && (
                          <span className="text-xs text-muted">(neaktivní)</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">
                        {catMap[p.category] || p.category}
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <StockBar
                            quantity={p.stock_quantity}
                            threshold={p.low_stock_threshold}
                          />
                          {isOut ? (
                            <Package className="h-3.5 w-3.5 text-red-500" />
                          ) : isLow ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <InlineEdit
                          value={p.stock_quantity}
                          onSave={(v) =>
                            handleStockUpdate(p.id, { stock_quantity: v })
                          }
                          className={
                            isOut
                              ? "text-red-600 font-bold"
                              : isLow
                                ? "text-amber-600 font-medium"
                                : "text-foreground"
                          }
                        />
                      </td>
                      <td className="px-1 py-2.5">
                        <AdjustButtons
                          saving={isSaving}
                          onAdjust={(delta) =>
                            handleStockUpdate(p.id, { stock_delta: delta })
                          }
                        />
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <InlineEdit
                          value={p.low_stock_threshold}
                          onSave={(v) =>
                            handleStockUpdate(p.id, {
                              low_stock_threshold: v,
                            })
                          }
                          className="text-muted"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted">
                        {formatPrice(p.price_czk)}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted"
                    >
                      Žádné produkty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right sidebar — Categories (always visible on desktop) */}
      <div className={`${showCategories ? "block" : "hidden"} lg:block`}>
        <CategoryManager categories={categories} onRefresh={load} />
      </div>
    </div>
  );
}

export default function SkladPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="sklad" />
      <main className="mx-auto max-w-7xl px-4 py-6">
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
