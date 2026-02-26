import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

// Default categories to seed if table is empty
const DEFAULT_CATEGORIES = [
  { slug: "rackets", label: "Rakety", sort_order: 0 },
  { slug: "shuttlecocks", label: "Košíčky", sort_order: 1 },
  { slug: "clothing", label: "Oblečení", sort_order: 2 },
  { slug: "shoes", label: "Obuv", sort_order: 3 },
  { slug: "accessories", label: "Doplňky", sort_order: 4 },
  { slug: "nutrition", label: "Výživa", sort_order: 5 },
  { slug: "gift_cards", label: "Dárkové poukazy", sort_order: 6 },
  { slug: "memberships", label: "Permanentky", sort_order: 7 },
  { slug: "tickets", label: "Vstupenky", sort_order: 8 },
  { slug: "merchandise", label: "Merchandising", sort_order: 9 },
];

export async function GET() {
  const auth = await requireAuth("reception");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();

    let { rows } = await sql`
      SELECT * FROM product_categories ORDER BY sort_order ASC, label ASC
    `;

    if (rows.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await sql`
          INSERT INTO product_categories (slug, label, sort_order)
          VALUES (${cat.slug}, ${cat.label}, ${cat.sort_order})
          ON CONFLICT (slug) DO NOTHING
        `;
      }
      const result = await sql`
        SELECT * FROM product_categories ORDER BY sort_order ASC, label ASC
      `;
      rows = result.rows;
    }

    const { rows: counts } = await sql`
      SELECT category, COUNT(*) AS count
      FROM products
      GROUP BY category
    `;
    const countMap = Object.fromEntries(counts.map((r) => [r.category, Number(r.count)]));

    const categories = rows.map((r) => ({
      ...r,
      product_count: countMap[r.slug] ?? 0,
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/eshop/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { slug, label } = await request.json();

    if (!slug || !label) {
      return NextResponse.json({ error: "Slug a název jsou povinné" }, { status: 400 });
    }

    const { rows: maxRows } = await sql`
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM product_categories
    `;

    const { rows } = await sql`
      INSERT INTO product_categories (slug, label, sort_order)
      VALUES (${slug}, ${label}, ${maxRows[0].next_order})
      ON CONFLICT (slug) DO UPDATE SET label = ${label}
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/eshop/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
