import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth("reception");
    if (isAuthError(user)) return user;

    await ensureTable();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await sql.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
      values
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/eshop/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
