"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Loader2, Package, Plus } from "lucide-react";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types/eshop";
import { fetchOrders } from "@/lib/eshop-api";
import AppHeader from "@/components/AppHeader";
import OrderTable from "@/components/eshop/OrderTable";
import QuickSaleModal from "@/components/eshop/QuickSaleModal";
import EshopKpiCards from "@/components/eshop/EshopKpiCards";

const statuses: (OrderStatus | "all")[] = ["all", "pending", "paid", "preparing", "ready", "completed", "cancelled"];

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showQuickSale, setShowQuickSale] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <EshopKpiCards />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Objednávky</h2>
          <p className="text-sm text-muted">Správa a přehled objednávek</p>
        </div>
        <button
          onClick={() => setShowQuickSale(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Nový prodej
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-background text-muted hover:text-foreground"
            }`}
          >
            {s === "all" ? "Vše" : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <OrderTable orders={orders} onUpdate={load} />
        </div>
      )}

      {showQuickSale && (
        <QuickSaleModal
          onClose={() => setShowQuickSale(false)}
          onComplete={load}
        />
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="objednavky" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <OrdersContent />
        </Suspense>
      </main>
    </div>
  );
}
