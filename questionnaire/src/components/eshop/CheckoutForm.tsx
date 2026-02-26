"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CartItem } from "@/types/eshop";
import { submitCheckout } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import OrderSummary from "./OrderSummary";
import DiscountCodeInput from "./DiscountCodeInput";

interface Props {
  items: CartItem[];
  subtotal: number;
  onSuccess: (orderId: string) => void;
}

export default function CheckoutForm({ items, subtotal, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = subtotal - discountAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await submitCheckout({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        email,
        phone: phone || undefined,
        customer_name: name,
        discount_code: discountCode || undefined,
        note: note || undefined,
      });

      // Redirect to Comgate payment
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      } else {
        onSuccess(result.order_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se vytvořit objednávku");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-bold text-foreground">Kontaktní údaje</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Jméno a příjmení *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold text-foreground">Způsob doručení</h3>
          <div className="rounded-lg border border-primary bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
              <span className="text-sm font-medium text-foreground">Osobní odběr na recepci</span>
            </div>
            <p className="mt-1 pl-6 text-xs text-muted">Hala Krašovská, po zaplacení objednávky</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold text-foreground">Slevový kód</h3>
          <DiscountCodeInput
            subtotal={subtotal}
            onApply={(code, amount) => {
              setDiscountCode(code);
              setDiscountAmount(amount);
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Poznámka</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Volitelná poznámka k objednávce..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Zpracovávám...
            </>
          ) : (
            `Zaplatit ${formatPrice(total)}`
          )}
        </button>
      </form>

      <div>
        <OrderSummary
          items={items}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
        />
      </div>
    </div>
  );
}
