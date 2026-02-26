"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCart, Loader2, Check, ChevronRight, Store, Lock, RotateCcw } from "lucide-react";
import { Product } from "@/types/eshop";
import { PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types/eshop";
import { fetchProduct } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import { useCart } from "@/hooks/useCart";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

function StockIndicator({ quantity }: { quantity: number }) {
  if (quantity <= 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="font-medium text-danger">Vyprodáno</span>
      </div>
    );
  }
  if (quantity <= 5) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="font-medium text-amber-600">Poslední kusy ({quantity} ks)</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-success" />
      <span className="font-medium text-success">Skladem</span>
    </div>
  );
}

function TrustSignals() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <Store className="h-5 w-5 flex-shrink-0 text-primary" />
        <span className="text-xs text-foreground">Osobní odběr zdarma</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <Lock className="h-5 w-5 flex-shrink-0 text-primary" />
        <span className="text-xs text-foreground">Bezpečná platba</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <RotateCcw className="h-5 w-5 flex-shrink-0 text-primary" />
        <span className="text-xs text-foreground">Vrácení do 14 dnů</span>
      </div>
    </div>
  );
}

function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchProduct(slug);
      setProduct(data);
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAdd() {
    if (!product) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price_czk: product.price_czk,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-bold text-foreground">Produkt nenalezen</h2>
        <button
          onClick={() => router.push("/eshop")}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Zpět do katalogu
        </button>
      </div>
    );
  }

  const discountAmount =
    product.compare_price_czk && product.compare_price_czk > product.price_czk
      ? product.compare_price_czk - product.price_czk
      : null;

  const discountPercent = discountAmount && product.compare_price_czk
    ? Math.round((discountAmount / product.compare_price_czk) * 100)
    : null;

  return (
    <>
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/eshop" className="hover:text-foreground">
          E-shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-muted">
          {PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] || product.category}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-background text-muted shadow-md">
              Bez obrázku
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 inline-block rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
            {PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] || product.category}
          </span>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price_czk)}
              </span>
              {product.compare_price_czk && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.compare_price_czk)}
                </span>
              )}
            </div>
            {discountAmount && discountPercent && (
              <p className="mt-1 text-sm font-medium text-danger">
                Ušetříte {formatPrice(discountAmount)} ({discountPercent} %)
              </p>
            )}
          </div>

          {product.description && (
            <p className="mt-4 leading-relaxed text-foreground">{product.description}</p>
          )}

          <div className="mt-4">
            <StockIndicator quantity={product.stock_quantity} />
          </div>

          {product.stock_quantity > 0 && (
            <button
              onClick={handleAdd}
              className={`mt-6 hidden items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 lg:flex ${
                added
                  ? "bg-success"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Přidáno do košíku
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Přidat do košíku
                </>
              )}
            </button>
          )}

          <TrustSignals />
        </div>
      </div>

      {product.stock_quantity > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price_czk)}
              </span>
              {product.compare_price_czk && (
                <span className="ml-2 text-sm text-muted line-through">
                  {formatPrice(product.compare_price_czk)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 ${
                added
                  ? "bg-success"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Přidáno
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Do košíku
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="eshop" />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <ProductDetail />
        </Suspense>
      </main>
    </div>
  );
}
