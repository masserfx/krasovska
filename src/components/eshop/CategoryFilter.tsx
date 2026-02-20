"use client";

import { useState, useEffect } from "react";
import { fetchCategories, CategoryData } from "@/lib/eshop-api";
import { PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types/eshop";
import { CategoryFilterSkeleton } from "./ProductSkeleton";

interface Props {
  value: string | null;
  onChange: (category: string | null) => void;
}

const staticCategories: CategoryData[] = (
  Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]
).map(([slug, label], i) => ({
  id: slug,
  slug,
  label,
  sort_order: i,
  is_active: true,
  product_count: 1, // assume at least 1 so they show
}));

export default function CategoryFilter({ value, onChange }: Props) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        const active = data
          .filter((c) => c.is_active && c.product_count > 0)
          .sort((a, b) => a.sort_order - b.sort_order);
        setCategories(active.length > 0 ? active : staticCategories);
      })
      .catch(() => setCategories(staticCategories))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CategoryFilterSkeleton />;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          value === null
            ? "bg-primary text-white"
            : "bg-background text-muted hover:text-foreground"
        }`}
      >
        Vše
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(value === cat.slug ? null : cat.slug)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            value === cat.slug
              ? "bg-primary text-white"
              : "bg-background text-muted hover:text-foreground"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
