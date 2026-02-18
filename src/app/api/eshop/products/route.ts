import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { generateSlug } from "@/lib/eshop-utils";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conditions: string[] = ["is_active = true"];
    const values: unknown[] = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const { rows } = await sql.query(
      `SELECT * FROM products ${where} ORDER BY sort_order ASC, created_at DESC`,
      values
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/eshop/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("admin");
    if (isAuthError(user)) return user;

    await ensureTable();
    const body = await request.json();
    const { name, description, price_czk, compare_price_czk, category, image_url, stock_quantity, is_active, sort_order, metadata } = body;

    if (!name || !price_czk || !category) {
      return NextResponse.json({ error: "Název, cena a kategorie jsou povinné" }, { status: 400 });
    }

    const slug = body.slug || generateSlug(name);

    const { rows } = await sql`
      INSERT INTO products (name, slug, description, price_czk, compare_price_czk, category, image_url, stock_quantity, is_active, sort_order, metadata)
      VALUES (${name}, ${slug}, ${description || null}, ${price_czk}, ${compare_price_czk || null}, ${category}, ${image_url || null}, ${stock_quantity ?? 0}, ${is_active ?? true}, ${sort_order ?? 0}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/eshop/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
