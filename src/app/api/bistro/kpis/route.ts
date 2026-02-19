import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

const SEED_KPIS = [
  { month_year: "2026-04", revenue_target: 89000, covers_target: 630, avg_ticket_target: 141, fixed_costs: 47500 },
  { month_year: "2026-05", revenue_target: 150000, covers_target: 1000, avg_ticket_target: 150, fixed_costs: 124000 },
  { month_year: "2026-06", revenue_target: 120000, covers_target: 800, avg_ticket_target: 150, fixed_costs: 124000 },
  { month_year: "2026-07", revenue_target: 200000, covers_target: 1290, avg_ticket_target: 155, fixed_costs: 163000 },
  { month_year: "2026-08", revenue_target: 180000, covers_target: 1160, avg_ticket_target: 155, fixed_costs: 163000 },
  { month_year: "2026-09", revenue_target: 250000, covers_target: 1613, avg_ticket_target: 155, fixed_costs: 163000 },
];

async function seedKpis() {
  for (const k of SEED_KPIS) {
    await sql`
      INSERT INTO bistro_kpis (month_year, revenue_target, covers_target, avg_ticket_target, fixed_costs)
      VALUES (${k.month_year}, ${k.revenue_target}, ${k.covers_target}, ${k.avg_ticket_target}, ${k.fixed_costs})
    `;
  }
}

export async function GET() {
  try {
    await ensureTable();

    const { rows } = await sql`SELECT * FROM bistro_kpis ORDER BY month_year ASC`;

    if (rows.length === 0) {
      await seedKpis();
      const { rows: seeded } = await sql`SELECT * FROM bistro_kpis ORDER BY month_year ASC`;
      return NextResponse.json(seeded);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/bistro/kpis error:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { month_year, revenue_target, revenue_actual, covers_target, covers_actual, avg_ticket_target, avg_ticket_actual, fixed_costs, variable_costs_actual } = body;

    if (!month_year) {
      return NextResponse.json({ error: "month_year is required" }, { status: 400 });
    }

    // Upsert by month_year
    const { rows: existing } = await sql`SELECT id FROM bistro_kpis WHERE month_year = ${month_year}`;

    if (existing.length > 0) {
      // Only update fields that were explicitly provided in the request body
      const existingRow = (await sql`SELECT * FROM bistro_kpis WHERE month_year = ${month_year}`).rows[0];
      const { rows } = await sql`
        UPDATE bistro_kpis
        SET revenue_target = ${revenue_target !== undefined ? revenue_target : existingRow.revenue_target},
            revenue_actual = ${revenue_actual !== undefined ? revenue_actual : existingRow.revenue_actual},
            covers_target = ${covers_target !== undefined ? covers_target : existingRow.covers_target},
            covers_actual = ${covers_actual !== undefined ? covers_actual : existingRow.covers_actual},
            avg_ticket_target = ${avg_ticket_target !== undefined ? avg_ticket_target : existingRow.avg_ticket_target},
            avg_ticket_actual = ${avg_ticket_actual !== undefined ? avg_ticket_actual : existingRow.avg_ticket_actual},
            fixed_costs = ${fixed_costs !== undefined ? fixed_costs : existingRow.fixed_costs},
            variable_costs_actual = ${variable_costs_actual !== undefined ? variable_costs_actual : existingRow.variable_costs_actual}
        WHERE month_year = ${month_year}
        RETURNING *
      `;
      return NextResponse.json(rows[0]);
    }

    const { rows } = await sql`
      INSERT INTO bistro_kpis (month_year, revenue_target, revenue_actual, covers_target, covers_actual, avg_ticket_target, avg_ticket_actual, fixed_costs, variable_costs_actual)
      VALUES (${month_year}, ${revenue_target ?? null}, ${revenue_actual ?? null}, ${covers_target ?? null}, ${covers_actual ?? null}, ${avg_ticket_target ?? null}, ${avg_ticket_actual ?? null}, ${fixed_costs ?? 47500}, ${variable_costs_actual ?? null})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/bistro/kpis error:", error);
    return NextResponse.json({ error: "Failed to upsert KPI" }, { status: 500 });
  }
}
