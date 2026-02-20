"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) return null;
  const color = quantity > 5 ? "bg-success" : "bg-amber-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-white font-medium rounded-full px-2 py-0.5 ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-white`} />
      {quantity > 5 ? "Skladem" : "Poslední kusy"}
    </span>
  );
}

export default function ProductCard({ product, onAddToCart, onClick }: Props) {
  const [added, setAdded] = useState(false);
  const soldOut = product.stock_quantity <= 0;

  const discountPercent =
    product.compare_price_czk && product.compare_price_czk > product.price_czk
      ? Math.round(
          ((product.compare_price_czk - product.price_czk) /
            product.compare_price_czk) *
            100
        )
      : null;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (added) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="relative cursor-pointer overflow-hidden" onClick={onClick}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-background text-muted">
            Bez obrázku
          </div>
        )}

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-700">
              Vyprodáno
            </span>
          </div>
        )}

        {discountPercent && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">
            −{discountPercent} %
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 cursor-pointer" onClick={onClick}>
        <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price_czk)}
            </span>
            {product.compare_price_czk && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compare_price_czk)}
              </span>
            )}
          </div>
          <div className="mt-1">
            <StockBadge quantity={product.stock_quantity} />
          </div>
        </div>
      </div>

      {!soldOut && (
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={handleAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
              added
                ? "bg-success"
                : "bg-primary hover:bg-primary-dark translate-y-0 group-hover:-translate-y-0.5"
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
      )}
    </div>
  );
}
