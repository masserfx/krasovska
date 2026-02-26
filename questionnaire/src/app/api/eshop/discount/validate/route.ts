import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, discount_amount: 0, message: "Zadejte slevový kód" });
    }

    const { rows } = await sql`
      SELECT * FROM discount_codes
      WHERE code = ${code.toUpperCase().trim()}
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
    `;

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, discount_amount: 0, message: "Neplatný slevový kód" });
    }

    const dc = rows[0];

    if (dc.max_uses && dc.used_count >= dc.max_uses) {
      return NextResponse.json({ valid: false, discount_amount: 0, message: "Slevový kód byl vyčerpán" });
    }

    if (dc.min_order_amount && subtotal < dc.min_order_amount) {
      const minCzk = Math.round(dc.min_order_amount / 100);
      return NextResponse.json({
        valid: false,
        discount_amount: 0,
        message: `Minimální hodnota objednávky je ${minCzk} Kč`,
      });
    }

    let discount_amount = 0;
    if (dc.discount_percent) {
      discount_amount = Math.round((subtotal * dc.discount_percent) / 100);
    } else if (dc.discount_amount) {
      discount_amount = dc.discount_amount;
    }

    // Sleva nesmí být větší než subtotal
    discount_amount = Math.min(discount_amount, subtotal);

    return NextResponse.json({
      valid: true,
      discount_amount,
      message: dc.discount_percent
        ? `Sleva ${dc.discount_percent} %`
        : `Sleva ${Math.round(discount_amount / 100)} Kč`,
    });
  } catch (error) {
    console.error("POST /api/eshop/discount/validate error:", error);
    return NextResponse.json({ error: "Failed to validate discount" }, { status: 500 });
  }
}
