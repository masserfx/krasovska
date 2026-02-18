import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureTable();
    const { slug } = await params;

    const { rows } = await sql`SELECT * FROM products WHERE slug = ${slug}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/eshop/products/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth("admin");
    if (isAuthError(user)) return user;

    await ensureTable();
    const { slug } = await params;
    const body = await request.json();

    const { rows: current } = await sql`SELECT * FROM products WHERE slug = ${slug}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
    }

    const p = current[0];
    const name = body.name ?? p.name;
    const newSlug = body.slug ?? p.slug;
    const description = body.description ?? p.description;
    const price_czk = body.price_czk ?? p.price_czk;
    const compare_price_czk = body.compare_price_czk ?? p.compare_price_czk;
    const category = body.category ?? p.category;
    const image_url = body.image_url ?? p.image_url;
    const stock_quantity = body.stock_quantity ?? p.stock_quantity;
    const is_active = body.is_active ?? p.is_active;
    const sort_order = body.sort_order ?? p.sort_order;
    const metadata = body.metadata ? JSON.stringify(body.metadata) : JSON.stringify(p.metadata || {});

    const { rows } = await sql`
      UPDATE products
      SET name = ${name}, slug = ${newSlug}, description = ${description},
          price_czk = ${price_czk}, compare_price_czk = ${compare_price_czk},
          category = ${category}, image_url = ${image_url},
          stock_quantity = ${stock_quantity}, is_active = ${is_active},
          sort_order = ${sort_order}, metadata = ${metadata},
          updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/eshop/products/[slug] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth("admin");
    if (isAuthError(user)) return user;

    await ensureTable();
    const { slug } = await params;

    const { rowCount } = await sql`DELETE FROM products WHERE slug = ${slug}`;
    if (rowCount === 0) {
      return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/eshop/products/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
