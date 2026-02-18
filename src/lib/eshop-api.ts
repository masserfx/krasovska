import { Product, Order, OrderStatus } from "@/types/eshop";

// --- Products ---

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await fetch(`/api/eshop/products${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst produkty");
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`/api/eshop/products/${slug}`);
  if (!res.ok) throw new Error("Produkt nenalezen");
  return res.json();
}

export async function createProduct(
  data: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const res = await fetch("/api/eshop/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se vytvořit produkt");
  return res.json();
}

export async function updateProduct(
  slug: string,
  data: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
): Promise<Product> {
  const res = await fetch(`/api/eshop/products/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se aktualizovat produkt");
  return res.json();
}

export async function deleteProduct(slug: string): Promise<void> {
  const res = await fetch(`/api/eshop/products/${slug}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Nepodařilo se smazat produkt");
}

// --- Orders ---

export async function fetchOrders(params?: {
  status?: string;
}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  const res = await fetch(`/api/eshop/orders${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst objednávky");
  return res.json();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const res = await fetch(`/api/eshop/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Nepodařilo se aktualizovat objednávku");
  return res.json();
}

// --- Discount ---

export async function validateDiscount(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount_amount: number; message: string }> {
  const res = await fetch("/api/eshop/discount/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) throw new Error("Nepodařilo se ověřit slevový kód");
  return res.json();
}

// --- Checkout ---

export interface CheckoutData {
  items: { product_id: string; quantity: number }[];
  email: string;
  phone?: string;
  customer_name: string;
  discount_code?: string;
  note?: string;
}

export async function submitCheckout(
  data: CheckoutData
): Promise<{ redirect_url: string; order_id: string }> {
  const res = await fetch("/api/eshop/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Nepodařilo se vytvořit objednávku");
  }
  return res.json();
}
