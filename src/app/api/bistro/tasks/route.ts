import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

const SEED_TASKS = [
  { title: "Rozhodnutí: spustit Quick Start", priority: "high", assignee: "Tomáš Knopp", sort_order: 0 },
  { title: "Schválit rozpočet 75–85 tis. Kč na Fázi 0", priority: "high", assignee: "Tomáš Knopp", sort_order: 1 },
  { title: "Ověřit stav HACCP dokumentace", priority: "high", assignee: "Tomáš Knopp", sort_order: 2 },
  { title: "Kontaktovat KHS Plzeň", priority: "high", assignee: "Tomáš Knopp", sort_order: 3 },
  { title: "Ověřit ŽL – hostinská činnost", priority: "medium", assignee: "Tomáš Knopp", sort_order: 4 },
  { title: "Zveřejnit inzerát na kuchaře", priority: "high", assignee: "Tomáš Knopp", sort_order: 5 },
  { title: "Objednat POS systém Dotykačka KOMPLET", priority: "high", assignee: "Tomáš Knopp", sort_order: 6 },
  { title: "Kontaktovat Plzeňský Prazdroj", priority: "medium", assignee: "Tomáš Knopp", sort_order: 7 },
  { title: "Nákup v Makro – polotovary a nápoje", priority: "high", assignee: null, sort_order: 8 },
  { title: "Objednat chladicí vitrínu", priority: "medium", assignee: null, sort_order: 9 },
  { title: "Nábor 1–2 brigádníků", priority: "medium", assignee: "Tomáš Knopp", sort_order: 10 },
  { title: "Instalace čepování (pivovar)", priority: "medium", assignee: null, sort_order: 11 },
  { title: "Školení brigádníka", priority: "medium", assignee: null, sort_order: 12 },
  { title: "Připravit ceník (tabule / tisk)", priority: "low", assignee: null, sort_order: 13 },
  { title: "Testovací provoz (1 den, členové)", priority: "high", assignee: null, sort_order: 14 },
  { title: "Social media oznámení – pilot", priority: "low", assignee: null, sort_order: 15 },
  { title: "Registrace na Wolt – zahájit onboarding", priority: "medium", assignee: null, sort_order: 16 },
  { title: "SPUŠTĚNÍ nouzového provozu", priority: "high", assignee: "Tomáš Knopp", sort_order: 17 },
];

async function seedTasks() {
  // Get phase 0 ID
  const { rows: phases } = await sql`SELECT id FROM bistro_phases WHERE phase_number = 0 LIMIT 1`;
  if (phases.length === 0) return;

  const phaseId = phases[0].id;

  for (const t of SEED_TASKS) {
    await sql`
      INSERT INTO bistro_tasks (phase_id, title, priority, assignee, sort_order, status)
      VALUES (${phaseId}, ${t.title}, ${t.priority}, ${t.assignee}, ${t.sort_order}, ${"todo"})
    `;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get("phase_id");

    let rows;
    if (phaseId) {
      const result = await sql`
        SELECT * FROM bistro_tasks
        WHERE phase_id = ${phaseId}
        ORDER BY sort_order ASC, created_at ASC
      `;
      rows = result.rows;
    } else {
      const result = await sql`
        SELECT * FROM bistro_tasks
        ORDER BY sort_order ASC, created_at ASC
      `;
      rows = result.rows;
    }

    if (rows.length === 0 && !phaseId) {
      await seedTasks();
      const result = await sql`SELECT * FROM bistro_tasks ORDER BY sort_order ASC, created_at ASC`;
      rows = result.rows;
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/bistro/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch bistro tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { phase_id, title, description, type, status, priority, assignee, due_date, sort_order } = body;

    if (!title || !phase_id) {
      return NextResponse.json({ error: "Title and phase_id are required" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO bistro_tasks (phase_id, title, description, type, status, priority, assignee, due_date, sort_order)
      VALUES (${phase_id}, ${title}, ${description || null}, ${type || "task"}, ${status || "todo"}, ${priority || "medium"}, ${assignee || null}, ${due_date || null}, ${sort_order ?? 0})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/bistro/tasks error:", error);
    return NextResponse.json({ error: "Failed to create bistro task" }, { status: 500 });
  }
}
