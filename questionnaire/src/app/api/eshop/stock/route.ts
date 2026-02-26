import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET() {
  const auth = await requireAuth("reception");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();

    // All products with stock info, ordered: low stock first
    const { rows: products } = await sql`
      SELECT id, name, slug, category, stock_quantity, low_stock_threshold, is_active, price_czk
      FROM products
      ORDER BY
        CASE WHEN stock_quantity <= low_stock_threshold THEN 0 ELSE 1 END,
        stock_quantity ASC,
        name ASC
    `;

    const lowStockCount = products.filter(
      (p) => p.is_active && p.stock_quantity <= p.low_stock_threshold
    ).length;

    return NextResponse.json({ low_stock_count: lowStockCount, products });
  } catch (error) {
    console.error("GET /api/eshop/stock error:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}
