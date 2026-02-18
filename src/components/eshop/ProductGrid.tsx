"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Package } from "lucide-react";
import { Product, ProductCategory } from "@/types/eshop";
import { fetchProducts } from "@/lib/eshop-api";
import ProductCard from "./ProductCard";
import CategoryFilter from "./CategoryFilter";

interface Props {
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart, onProductClick }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        category: category ?? undefined,
        search: search || undefined,
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter value={category} onChange={setCategory} />
        <input
          type="text"
          placeholder="Hledat produkty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted" />
          <h3 className="text-lg font-semibold text-foreground">Žádné produkty</h3>
          <p className="mt-1 text-sm text-muted">
            {search || category ? "Zkuste změnit filtry" : "V nabídce zatím nejsou žádné produkty"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
