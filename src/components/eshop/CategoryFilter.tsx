"use client";

import { ProductCategory, PRODUCT_CATEGORY_LABELS } from "@/types/eshop";

interface Props {
  value: ProductCategory | null;
  onChange: (category: ProductCategory | null) => void;
}

const categories = Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][];

export default function CategoryFilter({ value, onChange }: Props) {
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
      {categories.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(value === key ? null : key)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            value === key
              ? "bg-primary text-white"
              : "bg-background text-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
