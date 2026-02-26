"use client";

import { CartItem } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";

interface Props {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
}

export default function OrderSummary({ items, subtotal, discountAmount, total }: Props) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-foreground">Souhrn objednávky</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product_id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.name} <span className="text-muted">&times; {item.quantity}</span>
            </span>
            <span className="font-medium text-foreground">
              {formatPrice(item.price_czk * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Mezisoučet</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Sleva</span>
            <span className="text-success">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted">Doprava</span>
          <span className="text-foreground">Zdarma (osobní odběr)</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4">
        <span className="text-lg font-bold text-foreground">Celkem</span>
        <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
