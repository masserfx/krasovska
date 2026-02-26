import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET() {
  const auth = await requireAuth("reception");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();

    // Revenue by period — include all paid orders (paid, preparing, ready, completed)
    const paidStatuses = "('paid','preparing','ready','completed')";

    const { rows: revenueRows } = await sql.query(`
      SELECT
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN total ELSE 0 END), 0) AS today,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('week', CURRENT_DATE) THEN total ELSE 0 END), 0) AS week,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total ELSE 0 END), 0) AS month,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('year', CURRENT_DATE) THEN total ELSE 0 END), 0) AS year
      FROM orders
      WHERE status IN ${paidStatuses}
    `);

    const revenue = revenueRows[0];

    // Pending orders (need attention)
    const { rows: pendingRows } = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'paid') AS paid,
        COUNT(*) FILTER (WHERE status = 'preparing') AS preparing,
        COUNT(*) FILTER (WHERE status = 'ready') AS ready
      FROM orders
    `;
    const pending = pendingRows[0];

    // Orders count today
    const { rows: todayCountRows } = await sql.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE created_at >= CURRENT_DATE AND status IN ${paidStatuses}
    `);

    // Top 5 products this month by quantity
    const { rows: topProducts } = await sql.query(`
      SELECT
        item->>'name' AS name,
        SUM((item->>'qty')::int) AS total_qty,
        SUM((item->>'price')::bigint * (item->>'qty')::int) AS total_revenue
      FROM orders,
           jsonb_array_elements(items) AS item
      WHERE status IN ${paidStatuses}
        AND created_at >= date_trunc('month', CURRENT_DATE)
      GROUP BY item->>'name'
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    // Revenue last 7 days for mini chart
    const { rows: dailyRevenue } = await sql.query(`
      SELECT
        created_at::date AS day,
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*) AS orders
      FROM orders
      WHERE status IN ${paidStatuses}
        AND created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY created_at::date
      ORDER BY day ASC
    `);

    return NextResponse.json({
      revenue: {
        today: Number(revenue.today),
        week: Number(revenue.week),
        month: Number(revenue.month),
        year: Number(revenue.year),
      },
      pending: {
        paid: Number(pending.paid),
        preparing: Number(pending.preparing),
        ready: Number(pending.ready),
        total: Number(pending.paid) + Number(pending.preparing) + Number(pending.ready),
      },
      orders_today: Number(todayCountRows[0].count),
      top_products: topProducts.map((r) => ({
        name: r.name,
        qty: Number(r.total_qty),
        revenue: Number(r.total_revenue),
      })),
      daily_revenue: dailyRevenue.map((r) => ({
        day: r.day,
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      })),
    });
  } catch (error) {
    console.error("GET /api/eshop/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
