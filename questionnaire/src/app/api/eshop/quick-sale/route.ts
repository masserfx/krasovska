import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import { generateOrderNumber } from "@/lib/eshop-utils";

export async function POST(request: NextRequest) {
  const auth = await requireAuth("reception");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { items, payment_method, customer_name } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Žádné položky" }, { status: 400 });
    }

    if (!payment_method || !["cash", "card"].includes(payment_method)) {
      return NextResponse.json({ error: "Neplatná platební metoda" }, { status: 400 });
    }

    // Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { rows } = await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.product_id} AND stock_quantity >= ${item.quantity} AND is_active = true
        RETURNING id, name, price_czk
      `;

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Produkt není dostupný v požadovaném množství" },
          { status: 400 }
        );
      }

      const product = rows[0];
      orderItems.push({
        id: product.id,
        name: product.name,
        price: product.price_czk,
        qty: item.quantity,
      });
      subtotal += product.price_czk * item.quantity;
    }

    const orderNumber = generateOrderNumber();
    const deliveryMethod = payment_method === "cash" ? "reception_cash" : "reception_card";
    const name = customer_name?.trim() || "Prodej na recepci";

    // Create order as completed
    const { rows: orderRows } = await sql`
      INSERT INTO orders (order_number, email, phone, customer_name, items, subtotal, discount_amount, discount_code, total, status, delivery_method, note)
      VALUES (${orderNumber}, ${auth.email}, null, ${name}, ${JSON.stringify(orderItems)}, ${subtotal}, 0, null, ${subtotal}, 'completed', ${deliveryMethod}, null)
      RETURNING *
    `;

    const order = orderRows[0];

    // Create payment as paid
    await sql`
      INSERT INTO payments (order_id, amount, status, method, paid_at)
      VALUES (${order.id}, ${subtotal}, 'paid', ${deliveryMethod}, NOW())
    `;

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/eshop/quick-sale error:", error);
    return NextResponse.json({ error: "Nepodařilo se vytvořit prodej" }, { status: 500 });
  }
}
