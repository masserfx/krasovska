import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rows } = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/eshop/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    const body = await request.json();

    const { rows: current } = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    const status = body.status ?? current[0].status;

    const { rows } = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/eshop/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
