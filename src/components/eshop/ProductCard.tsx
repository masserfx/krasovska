"use client";

import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/eshop";
import { formatPrice } from "@/lib/eshop-utils";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}

export default function ProductCard({ product, onAddToCart, onClick }: Props) {
  return (
    <div className="group rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="cursor-pointer" onClick={onClick}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-48 w-full rounded-t-xl object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-t-xl bg-background text-muted">
            Bez obrázku
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price_czk)}</span>
            {product.compare_price_czk && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compare_price_czk)}
              </span>
            )}
          </div>
          {product.stock_quantity <= 0 && (
            <p className="mt-1 text-sm font-medium text-danger">Vyprodáno</p>
          )}
        </div>
      </div>
      {product.stock_quantity > 0 && (
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <ShoppingCart className="h-4 w-4" />
            Do košíku
          </button>
        </div>
      )}
    </div>
  );
}
