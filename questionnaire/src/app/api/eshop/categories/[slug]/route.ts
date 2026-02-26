import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { slug } = await params;
    const body = await request.json();

    const { rows } = await sql`
      UPDATE product_categories
      SET label = COALESCE(${body.label ?? null}, label),
          sort_order = COALESCE(${body.sort_order ?? null}, sort_order),
          is_active = COALESCE(${body.is_active ?? null}, is_active)
      WHERE slug = ${slug}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Kategorie nenalezena" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PATCH /api/eshop/categories/[slug] error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { slug } = await params;

    const { rows: products } = await sql`
      SELECT COUNT(*) AS count FROM products WHERE category = ${slug}
    `;
    if (Number(products[0].count) > 0) {
      return NextResponse.json(
        { error: `Nelze smazat — ${products[0].count} produktů používá tuto kategorii` },
        { status: 400 }
      );
    }

    const { rowCount } = await sql`DELETE FROM product_categories WHERE slug = ${slug}`;
    if (rowCount === 0) {
      return NextResponse.json({ error: "Kategorie nenalezena" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/eshop/categories/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
