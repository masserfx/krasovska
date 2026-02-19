// --- E-shop types ---

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_czk: number;
  compare_price_czk: number | null;
  category: ProductCategory;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price_czk: number;
  quantity: number;
  image_url: string | null;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  email: string;
  phone: string | null;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  total: number;
  status: OrderStatus;
  delivery_method: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Payment {
  id: string;
  order_id: string;
  comgate_trans_id: string | null;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  paid_at: string | null;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";
export type DeliveryMethod = "pickup" | "reception_cash" | "reception_card";

export type ProductCategory =
  | "rackets"
  | "shuttlecocks"
  | "clothing"
  | "shoes"
  | "accessories"
  | "nutrition"
  | "gift_cards"
  | "memberships"
  | "tickets"
  | "merchandise";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  rackets: "Rakety",
  shuttlecocks: "Košíčky",
  clothing: "Oblečení",
  shoes: "Obuv",
  accessories: "Doplňky",
  nutrition: "Výživa",
  gift_cards: "Dárkové poukazy",
  memberships: "Permanentky",
  tickets: "Vstupenky",
  merchandise: "Merchandising",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Čeká na platbu",
  paid: "Zaplaceno",
  preparing: "Připravuje se",
  ready: "Připraveno k vyzvednutí",
  completed: "Dokončeno",
  cancelled: "Zrušeno",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Čeká",
  paid: "Zaplaceno",
  cancelled: "Zrušeno",
  refunded: "Vráceno",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: "Osobní odběr (online platba)",
  reception_cash: "Recepce — hotovost",
  reception_card: "Recepce — karta",
};
