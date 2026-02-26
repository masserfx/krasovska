"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Product, ProductCategory, PRODUCT_CATEGORY_LABELS } from "@/types/eshop";
import { createProduct, updateProduct } from "@/lib/eshop-api";
import { generateSlug } from "@/lib/eshop-utils";

interface Props {
  product?: Product;
  onSave: () => void;
  onCancel: () => void;
}

const categories = Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][];

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [priceCzk, setPriceCzk] = useState(product ? String(product.price_czk / 100) : "");
  const [comparePriceCzk, setComparePriceCzk] = useState(
    product?.compare_price_czk ? String(product.compare_price_czk / 100) : ""
  );
  const [category, setCategory] = useState<ProductCategory>(product?.category || "rackets");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [stockQuantity, setStockQuantity] = useState(String(product?.stock_quantity ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.low_stock_threshold ?? 5));
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = {
        name,
        slug: slug || generateSlug(name),
        description: description || null,
        price_czk: Math.round(Number(priceCzk) * 100),
        compare_price_czk: comparePriceCzk ? Math.round(Number(comparePriceCzk) * 100) : null,
        category,
        image_url: imageUrl || null,
        stock_quantity: Number(stockQuantity),
        low_stock_threshold: Number(lowStockThreshold),
        is_active: isActive,
        sort_order: product?.sort_order ?? 0,
        metadata: product?.metadata ?? {},
      };

      if (product) {
        await updateProduct(product.slug, data);
      } else {
        await createProduct(data);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {product ? "Upravit produkt" : "Nový produkt"}
          </h3>
          <button onClick={onCancel} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Název *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!product) setSlug(generateSlug(e.target.value));
              }}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="automaticky z názvu"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Popis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Cena (Kč) *</label>
              <input
                type="number"
                value={priceCzk}
                onChange={(e) => setPriceCzk(e.target.value)}
                required
                min="0"
                step="1"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Původní cena (Kč)</label>
              <input
                type="number"
                value={comparePriceCzk}
                onChange={(e) => setComparePriceCzk(e.target.value)}
                min="0"
                step="1"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Kategorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {categories.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Skladem (ks)</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                min="0"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Minimum skladem (alert pod touto hodnotou)
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              min="0"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">URL obrázku</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            Aktivní (zobrazovat v katalogu)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Ukládám..." : product ? "Uložit" : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
