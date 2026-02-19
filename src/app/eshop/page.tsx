"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Product } from "@/types/eshop";
import { useCart } from "@/hooks/useCart";
import AppHeader from "@/components/AppHeader";
import ProductGrid from "@/components/eshop/ProductGrid";
import CartDrawer from "@/components/eshop/CartDrawer";
import CartToast from "@/components/eshop/CartToast";

interface ToastItem {
  name: string;
  image_url: string | null;
}

function EshopContent() {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, total, itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [toastItem, setToastItem] = useState<ToastItem | null>(null);

  function handleAddToCart(product: Product) {
    addItem({
      product_id: product.id,
      name: product.name,
      price_czk: product.price_czk,
      image_url: product.image_url,
    });
    setToastItem({ name: product.name, image_url: product.image_url });
  }

  function handleProductClick(product: Product) {
    router.push(`/eshop/${product.slug}`);
  }

  const dismissToast = useCallback(() => setToastItem(null), []);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">E-shop</h2>
          <p className="text-sm text-muted">Vybavení a doplňky pro badminton</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
        >
          <ShoppingCart className="h-4 w-4" />
          Košík
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      <ProductGrid
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setCartOpen(false);
          router.push("/eshop/kosik");
        }}
      />

      <CartToast item={toastItem} onDismiss={dismissToast} />
    </>
  );
}

export default function EshopPage() {
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
          <EshopContent />
        </Suspense>
      </main>
    </div>
  );
}
