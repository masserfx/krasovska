"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Printer, CheckSquare, Square, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Product } from "@/types/eshop";
import { fetchProducts } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";

function QrPrintContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }

  async function generateAndPrint() {
    if (selected.size === 0) return;
    setGenerating(true);

    const baseUrl = window.location.origin;
    const urls: Record<string, string> = {};

    for (const id of selected) {
      try {
        const dataUrl = await QRCode.toDataURL(`${baseUrl}/eshop/s/${id}`, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        urls[id] = dataUrl;
      } catch {
        // skip
      }
    }

    setQrDataUrls(urls);
    setGenerating(false);

    // Wait for images to render, then print
    requestAnimationFrame(() => {
      window.print();
    });
  }

  const selectedProducts = products.filter((p) => selected.has(p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <>
      {/* Controls — hidden when printing */}
      <div className="mb-6 print:hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">QR štítky produktů</h2>
            <p className="text-sm text-muted">
              Vyberte produkty a vytiskněte QR kódy na štítky
            </p>
          </div>
          <button
            onClick={generateAndPrint}
            disabled={selected.size === 0 || generating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Tisknout ({selected.size})
          </button>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm">
          {/* Select all */}
          <button
            onClick={toggleAll}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-background"
          >
            {selected.size === products.length ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted" />
            )}
            Vybrat vše ({products.length} produktů)
          </button>

          {/* Product list */}
          <div className="max-h-[50vh] overflow-y-auto">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left text-sm hover:bg-background last:border-b-0"
              >
                {selected.has(p.id) ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-muted" />
                )}
                <span className="flex-1 truncate text-foreground">{p.name}</span>
                <span className="shrink-0 font-medium text-muted">
                  {formatPrice(p.price_czk)}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  Sklad: {p.stock_quantity}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Print layout — visible only when printing */}
      <div ref={printRef} className="hidden print:block">
        <div className="grid grid-cols-3 gap-4">
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center border border-gray-300 p-4 text-center"
              style={{ breakInside: "avoid" }}
            >
              {qrDataUrls[p.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrls[p.id]}
                  alt={`QR ${p.name}`}
                  className="mb-2 h-36 w-36"
                />
              ) : (
                <div className="mb-2 flex h-36 w-36 items-center justify-center bg-gray-100">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="text-sm font-bold leading-tight">{p.name}</div>
              <div className="mt-1 text-lg font-bold">{formatPrice(p.price_czk)}</div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                Hala Krašovská
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function QrPrintPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <AppHeader activeTab="eshop-admin" />
      </div>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <QrPrintContent />
        </Suspense>
      </main>
    </div>
  );
}
