import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

const SEED_PHASES = [
  { title: "Quick Start", description: "Rozhodnutí o variantě, legislativa, nábor, objednávky", phase_number: 0, start_date: "2026-02-19", end_date: "2026-03-31", status: "active", color: "blue" },
  { title: "MVP → Standard", description: "Instalace, HACCP, POS, nástup kuchaře, školení", phase_number: 1, start_date: "2026-04-01", end_date: "2026-04-30", status: "planned", color: "green" },
  { title: "Standard → Full", description: "Soft opening, testovací provoz, grand opening", phase_number: 2, start_date: "2026-05-01", end_date: "2026-06-30", status: "planned", color: "amber" },
  { title: "Full Operace", description: "Plný provoz, delivery, optimalizace, sezónní akce", phase_number: 3, start_date: "2026-07-01", end_date: "2026-12-31", status: "planned", color: "purple" },
];

async function seedPhases() {
  for (const p of SEED_PHASES) {
    await sql`
      INSERT INTO bistro_phases (title, description, phase_number, start_date, end_date, status, color)
      VALUES (${p.title}, ${p.description}, ${p.phase_number}, ${p.start_date}, ${p.end_date}, ${p.status}, ${p.color})
    `;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const reseed = searchParams.get("reseed");

    if (reseed === "true") {
      await sql`DELETE FROM bistro_tasks`;
      await sql`DELETE FROM bistro_phases`;
      await seedPhases();
      const { rows } = await sql`SELECT * FROM bistro_phases ORDER BY phase_number ASC`;
      return NextResponse.json({ reseeded: true, phases: rows });
    }

    const { rows } = await sql`SELECT * FROM bistro_phases ORDER BY phase_number ASC`;

    if (rows.length === 0) {
      await seedPhases();
      const { rows: seeded } = await sql`SELECT * FROM bistro_phases ORDER BY phase_number ASC`;
      return NextResponse.json(seeded);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/bistro/phases error:", error);
    return NextResponse.json({ error: "Failed to fetch phases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { title, description, phase_number, start_date, end_date, status, color } = body;

    if (!title || phase_number === undefined) {
      return NextResponse.json({ error: "Title and phase_number are required" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO bistro_phases (title, description, phase_number, start_date, end_date, status, color)
      VALUES (${title}, ${description || null}, ${phase_number}, ${start_date || null}, ${end_date || null}, ${status || "planned"}, ${color || "blue"})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/bistro/phases error:", error);
    return NextResponse.json({ error: "Failed to create phase" }, { status: 500 });
  }
}
