"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";

interface Props {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="flex gap-3">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-background text-xs text-muted">
          Foto
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
        <p className="text-sm font-semibold text-primary">
          {formatPrice(item.price_czk * item.quantity)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="rounded border border-border p-1 text-muted hover:text-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="rounded border border-border p-1 text-muted hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={onRemove}
            className="ml-auto text-muted hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
