import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { generateOrderNumber } from "@/lib/eshop-utils";
import { createPayment } from "@/lib/comgate";

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const { items, email, phone, customer_name, discount_code, note } = await request.json();

    if (!items?.length || !email || !customer_name) {
      return NextResponse.json({ error: "Vyplňte všechna povinná pole" }, { status: 400 });
    }

    // 1. Validate stock and get product data
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
        // Rollback previous stock updates — on error the whole TX is gone anyway
        return NextResponse.json(
          { error: `Produkt není dostupný v požadovaném množství` },
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

    // 2. Apply discount
    let discount_amount = 0;
    if (discount_code) {
      const { rows: dcRows } = await sql`
        SELECT * FROM discount_codes
        WHERE code = ${discount_code.toUpperCase().trim()}
          AND is_active = true
          AND (valid_from IS NULL OR valid_from <= NOW())
          AND (valid_until IS NULL OR valid_until >= NOW())
      `;

      if (dcRows.length > 0) {
        const dc = dcRows[0];
        if (dc.discount_percent) {
          discount_amount = Math.round((subtotal * dc.discount_percent) / 100);
        } else if (dc.discount_amount) {
          discount_amount = dc.discount_amount;
        }
        discount_amount = Math.min(discount_amount, subtotal);

        // Increment used_count
        await sql`UPDATE discount_codes SET used_count = used_count + 1 WHERE id = ${dc.id}`;
      }
    }

    const total = subtotal - discount_amount;
    const orderNumber = generateOrderNumber();

    // 3. Create order
    const { rows: orderRows } = await sql`
      INSERT INTO orders (order_number, email, phone, customer_name, items, subtotal, discount_amount, discount_code, total, status, delivery_method, note)
      VALUES (${orderNumber}, ${email}, ${phone || null}, ${customer_name}, ${JSON.stringify(orderItems)}, ${subtotal}, ${discount_amount}, ${discount_code || null}, ${total}, 'pending', 'pickup', ${note || null})
      RETURNING *
    `;

    const order = orderRows[0];

    // 4. Create payment record
    await sql`
      INSERT INTO payments (order_id, amount, status)
      VALUES (${order.id}, ${total}, 'pending')
    `;

    // 5. Create Comgate payment (if credentials configured)
    const comgateMerchant = process.env.COMGATE_MERCHANT;
    if (comgateMerchant) {
      const comgate = await createPayment({
        order_id: order.id,
        order_number: orderNumber,
        amount_halere: total,
        email,
      });

      await sql`
        UPDATE payments SET comgate_trans_id = ${comgate.trans_id} WHERE order_id = ${order.id}
      `;

      return NextResponse.json({
        redirect_url: comgate.redirect_url,
        order_id: order.id,
      });
    }

    // Comgate not configured — mark as paid and redirect to thank you page
    await sql`
      UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ${order.id}
    `;
    await sql`
      UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ${order.id}
    `;

    return NextResponse.json({
      redirect_url: null,
      order_id: order.id,
    });
  } catch (error) {
    console.error("POST /api/eshop/checkout error:", error);
    return NextResponse.json({ error: "Nepodařilo se vytvořit objednávku" }, { status: 500 });
  }
}
