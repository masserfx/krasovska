import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("reception");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { id } = await params;
    const body = await request.json();

    if (body.stock_delta !== undefined) {
      const { rows: current } = await sql`SELECT stock_quantity FROM products WHERE id = ${id}`;
      if (current.length === 0) {
        return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
      }
      const newQty = Math.max(0, current[0].stock_quantity + Number(body.stock_delta));
      const { rows } = await sql`
        UPDATE products SET stock_quantity = ${newQty}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(rows[0]);
    }

    if (body.stock_quantity !== undefined) {
      const qty = Math.max(0, Number(body.stock_quantity));
      const threshold = body.low_stock_threshold;

      if (threshold !== undefined) {
        const { rows } = await sql`
          UPDATE products
          SET stock_quantity = ${qty}, low_stock_threshold = ${Number(threshold)}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        if (rows.length === 0) return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
        return NextResponse.json(rows[0]);
      }

      const { rows } = await sql`
        UPDATE products SET stock_quantity = ${qty}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    if (body.low_stock_threshold !== undefined) {
      const { rows } = await sql`
        UPDATE products SET low_stock_threshold = ${Number(body.low_stock_threshold)}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    return NextResponse.json({ error: "Žádná pole k aktualizaci" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/eshop/stock/[id] error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
