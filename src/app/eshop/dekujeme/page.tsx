"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const pending = searchParams.get("pending");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {pending ? (
        <Clock className="mb-4 h-16 w-16 text-amber-500" />
      ) : (
        <CheckCircle className="mb-4 h-16 w-16 text-success" />
      )}

      <h1 className="text-2xl font-bold text-foreground">
        {pending ? "Platba se zpracovává" : "Děkujeme za objednávku!"}
      </h1>

      <p className="mt-2 max-w-md text-muted">
        {pending
          ? "Vaše platba se stále zpracovává. O výsledku vás budeme informovat e-mailem."
          : "Vaše objednávka byla úspěšně přijata. Potvrzení jsme vám zaslali e-mailem."}
      </p>

      {orderId && (
        <p className="mt-4 text-sm text-muted">
          ID objednávky: <span className="font-mono font-medium text-foreground">{orderId}</span>
        </p>
      )}

      <div className="mt-4 text-sm text-muted">
        <strong>Způsob doručení:</strong> Osobní odběr na recepci Hala Krašovská
      </div>

      <Link
        href="/eshop"
        className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Zpět do e-shopu
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
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
          <ThankYouContent />
        </Suspense>
      </main>
    </div>
  );
}
