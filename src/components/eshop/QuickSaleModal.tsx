"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Loader2,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { Product } from "@/types/eshop";
import { fetchProducts, submitQuickSale } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import QrScanner from "./QrScanner";

interface SaleItem {
  product_id: string;
  name: string;
  price_czk: number;
  quantity: number;
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export default function QuickSaleModal({ onClose, onComplete }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchProducts({ search: search || undefined });
      setProducts(data);
    } catch {
      // silent
    }
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleScan(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product && product.stock_quantity > 0) {
      addToCart(product);
    }
    setShowScanner(false);
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product_id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price_czk: product.price_czk,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      const next = prev
        .map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0);
      return next;
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }

  const total = cart.reduce((sum, i) => sum + i.price_czk * i.quantity, 0);

  async function handleSubmit(paymentMethod: "cash" | "card") {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const order = await submitQuickSale({
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method: paymentMethod,
      });
      setDone(order.order_number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se vytvořit prodej");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-xl">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Prodej dokončen</h2>
          <p className="mb-1 text-sm text-muted">Objednávka</p>
          <p className="mb-4 font-mono text-lg font-bold text-foreground">{done}</p>
          <p className="mb-6 text-2xl font-bold text-foreground">{formatPrice(total)}</p>
          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Hotovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Nový prodej na recepci</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Left: Product grid */}
          <div className="relative flex flex-1 flex-col border-r border-border">
            {/* Scanner overlay */}
            {showScanner && (
              <QrScanner
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
              />
            )}

            {/* Search + Camera */}
            <div className="border-b border-border p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Hledat produkt..."
                    autoFocus
                    className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowScanner(true)}
                  title="Skenovat QR kód"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground hover:bg-background"
                >
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">QR</span>
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.stock_quantity <= 0}
                    className="flex flex-col items-start rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-sm font-medium text-foreground line-clamp-2">
                      {p.name}
                    </span>
                    <span className="mt-1 text-xs text-muted">
                      {p.stock_quantity > 0
                        ? `Sklad: ${p.stock_quantity}`
                        : "Vyprodáno"}
                    </span>
                    <span className="mt-auto pt-2 text-sm font-bold text-primary">
                      {formatPrice(p.price_czk)}
                    </span>
                  </button>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-muted">
                    Žádné produkty
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Cart + payment */}
          <div className="flex w-80 flex-col">
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted">
                Položky ({cart.length})
              </h3>
              {cart.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  Klikněte na produkt pro přidání
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-2 rounded-lg border border-border p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted">
                          {formatPrice(item.price_czk)} / ks
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.product_id, -1)}
                          className="rounded p-1 text-muted hover:bg-background hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product_id, 1)}
                          className="rounded p-1 text-muted hover:bg-background hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-1 rounded p-1 text-muted hover:bg-red-50 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total + Payment buttons */}
            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Celkem</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              {error && (
                <div className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSubmit("cash")}
                  disabled={cart.length === 0 || submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                  Hotovost
                </button>
                <button
                  onClick={() => handleSubmit("card")}
                  disabled={cart.length === 0 || submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Karta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
