const COMGATE_URL = "https://payments.comgate.cz/v1.0";

const COMGATE_MERCHANT = process.env.COMGATE_MERCHANT || "";
const COMGATE_SECRET = process.env.COMGATE_SECRET || "";
const COMGATE_TEST = process.env.COMGATE_TEST !== "false"; // default true

interface CreatePaymentParams {
  order_id: string;
  order_number: string;
  amount_halere: number;
  email: string;
}

interface CreatePaymentResult {
  redirect_url: string;
  trans_id: string;
}

/**
 * Create a Comgate payment.
 * Amount is converted from halere to CZK (Comgate expects whole CZK).
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResult> {
  const amountCzk = Math.round(params.amount_halere / 100);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hala-krasovska.vercel.app";

  const body = new URLSearchParams({
    merchant: COMGATE_MERCHANT,
    secret: COMGATE_SECRET,
    price: String(amountCzk),
    curr: "CZK",
    label: `Objednávka ${params.order_number}`,
    refId: params.order_id,
    email: params.email,
    prepareOnly: "true",
    country: "CZ",
    lang: "cs",
    method: "ALL",
    url_ok: `${baseUrl}/api/eshop/payment/return?status=ok`,
    url_cancel: `${baseUrl}/api/eshop/payment/return?status=cancel`,
    url_pending: `${baseUrl}/api/eshop/payment/return?status=pending`,
    url_callback: `${baseUrl}/api/eshop/payment/callback`,
    ...(COMGATE_TEST ? { test: "true" } : {}),
  });

  const res = await fetch(`${COMGATE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  const data = Object.fromEntries(new URLSearchParams(text));

  if (data.code !== "0") {
    throw new Error(`Comgate create error: ${data.message || text}`);
  }

  return {
    redirect_url: data.redirect,
    trans_id: data.transId,
  };
}

interface PaymentStatus {
  status: "PENDING" | "PAID" | "CANCELLED" | "AUTHORIZED";
  amount: number;
  method: string;
}

/**
 * Verify payment status with Comgate.
 */
export async function verifyPayment(transId: string): Promise<PaymentStatus> {
  const body = new URLSearchParams({
    merchant: COMGATE_MERCHANT,
    secret: COMGATE_SECRET,
    transId,
  });

  const res = await fetch(`${COMGATE_URL}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  const data = Object.fromEntries(new URLSearchParams(text));

  if (data.code !== "0") {
    throw new Error(`Comgate status error: ${data.message || text}`);
  }

  return {
    status: data.status as PaymentStatus["status"],
    amount: Number(data.price),
    method: data.method || "",
  };
}
