import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { verifyPayment } from "@/lib/comgate";
import { sendOrderConfirmation, sendNewOrderNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    // Comgate sends form-encoded POST
    const formData = await request.formData();
    const transId = formData.get("transId") as string;
    const status = formData.get("status") as string;

    if (!transId) {
      return NextResponse.json({ error: "Missing transId" }, { status: 400 });
    }

    // Double-check with Comgate API
    const verified = await verifyPayment(transId);

    // Find payment record
    const { rows: payments } = await sql`
      SELECT * FROM payments WHERE comgate_trans_id = ${transId}
    `;

    if (payments.length === 0) {
      console.error("Payment callback: unknown transId", transId);
      return new NextResponse("OK", { status: 200 });
    }

    const payment = payments[0];

    if (verified.status === "PAID" || status === "PAID") {
      await sql`
        UPDATE payments
        SET status = 'paid', method = ${verified.method}, paid_at = NOW(),
            raw_response = ${JSON.stringify({ transId, status, verified })}
        WHERE id = ${payment.id}
      `;

      await sql`
        UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ${payment.order_id}
      `;

      // Send confirmation emails
      const { rows: orderRows } = await sql`
        SELECT * FROM orders WHERE id = ${payment.order_id}
      `;
      if (orderRows.length > 0) {
        const order = orderRows[0];
        const emailData = {
          order_number: order.order_number,
          customer_name: order.customer_name,
          email: order.email,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
          subtotal: order.subtotal,
          discount_amount: order.discount_amount,
          total: order.total,
          delivery_method: order.delivery_method,
        };
        sendOrderConfirmation(emailData);
        sendNewOrderNotification(emailData);
      }
    } else if (verified.status === "CANCELLED" || status === "CANCELLED") {
      await sql`
        UPDATE payments
        SET status = 'cancelled',
            raw_response = ${JSON.stringify({ transId, status, verified })}
        WHERE id = ${payment.id}
      `;

      await sql`
        UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ${payment.order_id}
      `;
    }

    // Comgate expects "OK" response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("POST /api/eshop/payment/callback error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
