"use client";

import { X, ShoppingCart } from "lucide-react";
import { CartItem } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";
import CartItemRow from "./CartItemRow";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  open,
  onClose,
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Košík</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-3 h-10 w-10 text-muted" />
              <p className="text-sm text-muted">Košík je prázdný</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={(qty) => onUpdateQuantity(item.product_id, qty)}
                  onRemove={() => onRemoveItem(item.product_id)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-foreground">Celkem</span>
              <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Přejít k pokladně
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
