"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import AppHeader from "@/components/AppHeader";
import CheckoutForm from "@/components/eshop/CheckoutForm";

function CheckoutContent() {
  const router = useRouter();
  const { items, loaded, total, clearCart, itemCount } = useCart();
  const checkoutDone = useRef(false);

  useEffect(() => {
    if (loaded && itemCount === 0 && !checkoutDone.current) {
      router.push("/eshop/kosik");
    }
  }, [loaded, itemCount, router]);

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (itemCount === 0) return null;

  function handleSuccess(orderId: string) {
    checkoutDone.current = true;
    clearCart();
    router.push(`/eshop/dekujeme?order=${orderId}`);
  }

  return (
    <>
      <button
        onClick={() => router.push("/eshop/kosik")}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět do košíku
      </button>

      <h2 className="mb-6 text-xl font-bold text-foreground">Pokladna</h2>

      <CheckoutForm items={items} subtotal={total} onSuccess={handleSuccess} />
    </>
  );
}

export default function CheckoutPage() {
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
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}
