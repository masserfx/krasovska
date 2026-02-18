"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { Product } from "@/types/eshop";
import { PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types/eshop";
import { fetchProduct } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import { useCart } from "@/hooks/useCart";
import AppHeader from "@/components/AppHeader";

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

  return (
    <>
      <button
        onClick={() => router.push("/eshop")}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět do katalogu
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-80 items-center justify-center rounded-xl bg-background text-muted">
              Bez obrázku
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 inline-block rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
            {PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] || product.category}
          </span>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price_czk)}
            </span>
            {product.compare_price_czk && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.compare_price_czk)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 leading-relaxed text-foreground">{product.description}</p>
          )}

          <div className="mt-2 text-sm text-muted">
            {product.stock_quantity > 0
              ? `Skladem: ${product.stock_quantity} ks`
              : "Vyprodáno"}
          </div>

          {product.stock_quantity > 0 && (
            <button
              onClick={handleAdd}
              className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? "Přidáno!" : "Přidat do košíku"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="eshop" />
      <main className="mx-auto max-w-7xl px-4 py-6">
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
