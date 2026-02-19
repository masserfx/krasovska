import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Hala Krašovská <objednavky@halakrasovska.cz>";
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "admin@halakrasovska.cz";

interface OrderEmailData {
  order_number: string;
  customer_name: string;
  email: string;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  discount_amount: number;
  total: number;
  delivery_method: string;
}

function formatCzk(halere: number): string {
  return Math.round(halere / 100).toLocaleString("cs-CZ") + " Kč";
}

function buildItemRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center">${i.qty}×</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${formatCzk(i.price * i.qty)}</td>
        </tr>`
    )
    .join("");
}

function orderConfirmationHtml(data: OrderEmailData): string {
  const isPos = data.delivery_method.startsWith("reception_");
  const paymentLabel = isPos
    ? data.delivery_method === "reception_cash"
      ? "Hotovost na recepci"
      : "Karta na recepci"
    : "Online platba";

  return `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
      <!-- Header -->
      <div style="background:#1e40af;padding:24px 32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:20px">Potvrzení objednávky</h1>
        <p style="margin:8px 0 0;color:#93c5fd;font-size:14px">${data.order_number}</p>
      </div>

      <!-- Body -->
      <div style="padding:32px">
        <p style="margin:0 0 20px;color:#334155;font-size:14px">
          Dobrý den, ${data.customer_name},<br>
          děkujeme za vaši objednávku.
        </p>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
          <thead>
            <tr>
              <th style="padding:8px 0;border-bottom:2px solid #1e40af;text-align:left;font-size:12px;color:#64748b">Položka</th>
              <th style="padding:8px 0;border-bottom:2px solid #1e40af;text-align:center;font-size:12px;color:#64748b">Množství</th>
              <th style="padding:8px 0;border-bottom:2px solid #1e40af;text-align:right;font-size:12px;color:#64748b">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemRows(data.items)}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin-top:16px;text-align:right;font-size:14px;color:#334155">
          ${data.discount_amount > 0 ? `<div>Mezisoučet: ${formatCzk(data.subtotal)}</div><div style="color:#10b981">Sleva: -${formatCzk(data.discount_amount)}</div>` : ""}
          <div style="margin-top:8px;font-size:20px;font-weight:bold;color:#1e40af">
            Celkem: ${formatCzk(data.total)}
          </div>
        </div>

        <!-- Pickup info -->
        <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:8px;font-size:13px;color:#334155">
          <strong>Platba:</strong> ${paymentLabel}<br>
          <strong>Odběr:</strong> Osobní odběr na recepci<br>
          <strong>Adresa:</strong> Krašovská 32, Plzeň-Bolevec
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8">
        Hala Krašovská &middot; Krašovská 32, Plzeň-Bolevec
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send order confirmation to customer.
 * Non-blocking — errors are logged but don't throw.
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.email,
      subject: `Objednávka ${data.order_number} — Hala Krašovská`,
      html: orderConfirmationHtml(data),
    });
  } catch (err) {
    console.error("Email: failed to send order confirmation:", err);
  }
}

/**
 * Notify reception/admin about a new online order.
 * Non-blocking.
 */
export async function sendNewOrderNotification(data: OrderEmailData) {
  const resend = getResend();
  if (!resend) return;

  const itemList = data.items.map((i) => `${i.qty}× ${i.name}`).join(", ");

  try {
    await resend.emails.send({
      from: FROM,
      to: NOTIFICATION_EMAIL,
      subject: `Nová objednávka ${data.order_number} — ${formatCzk(data.total)}`,
      html: `
        <h2>Nová online objednávka</h2>
        <p><strong>Číslo:</strong> ${data.order_number}</p>
        <p><strong>Zákazník:</strong> ${data.customer_name} (${data.email})</p>
        <p><strong>Položky:</strong> ${itemList}</p>
        <p><strong>Celkem:</strong> ${formatCzk(data.total)}</p>
        <p>Objednávka čeká na přípravu k vyzvednutí.</p>
      `,
    });
  } catch (err) {
    console.error("Email: failed to send order notification:", err);
  }
}
