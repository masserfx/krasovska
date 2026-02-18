"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Plus, Loader2, Package, Pencil, Trash2 } from "lucide-react";
import { Product, PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types/eshop";
import { fetchProducts, deleteProduct } from "@/lib/eshop-api";
import { formatPrice } from "@/lib/eshop-utils";
import AppHeader from "@/components/AppHeader";
import ProductForm from "@/components/eshop/ProductForm";

function AdminContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug: string) {
    if (!confirm("Opravdu chcete smazat tento produkt?")) return;
    try {
      await deleteProduct(slug);
      load();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }

  function handleEdit(product: Product) {
    setEditProduct(product);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditProduct(undefined);
    load();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Správa produktů</h2>
          <p className="text-sm text-muted">
            {products.length} {products.length === 1 ? "produkt" : products.length < 5 ? "produkty" : "produktů"}
          </p>
        </div>
        <button
          onClick={() => { setEditProduct(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Nový produkt
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted" />
          <h3 className="text-lg font-semibold text-foreground">Žádné produkty</h3>
          <p className="mt-1 text-sm text-muted">Přidejte první produkt do e-shopu</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 font-medium text-muted">Produkt</th>
                <th className="px-4 py-3 font-medium text-muted">Kategorie</th>
                <th className="px-4 py-3 font-medium text-muted">Cena</th>
                <th className="px-4 py-3 font-medium text-muted">Sklad</th>
                <th className="px-4 py-3 font-medium text-muted">Stav</th>
                <th className="px-4 py-3 font-medium text-muted">Akce</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-xs text-muted">—</div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-xs text-muted">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] || product.category}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price_czk)}</td>
                  <td className="px-4 py-3">{product.stock_quantity} ks</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.is_active ? "Aktivní" : "Neaktivní"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-muted hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="text-muted hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleFormClose}
          onCancel={() => { setShowForm(false); setEditProduct(undefined); }}
        />
      )}
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="eshop" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <AdminContent />
        </Suspense>
      </main>
    </div>
  );
}
