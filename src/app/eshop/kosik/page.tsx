"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";
import CartItemRow from "@/components/eshop/CartItemRow";
import CheckoutSteps from "@/components/eshop/CheckoutSteps";

function CartContent() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="mb-4 h-12 w-12 text-muted" />
        <h2 className="text-lg font-bold text-foreground">Košík je prázdný</h2>
        <p className="mt-1 text-sm text-muted">Přidejte produkty z našeho katalogu</p>
        <button
          onClick={() => router.push("/eshop")}
          className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Prohlédnout nabídku
        </button>
      </div>
    );
  }

  return (
    <>
      <CheckoutSteps currentStep={1} />

      <button
        onClick={() => router.push("/eshop")}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Pokračovat v nákupu
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Košík ({itemCount} {itemCount === 1 ? "položka" : itemCount < 5 ? "položky" : "položek"})
              </h2>
              <button
                onClick={clearCart}
                className="text-sm text-muted hover:text-danger"
              >
                Vyprázdnit
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.product_id, qty)}
                  onRemove={() => removeItem(item.product_id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-foreground">Souhrn</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Mezisoučet</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Doprava</span>
                <span className="text-foreground">Zdarma</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-bold text-foreground">Celkem</span>
              <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => router.push("/eshop/pokladna")}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Přejít k pokladně
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
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
          <CartContent />
        </Suspense>
      </main>
    </div>
  );
}
