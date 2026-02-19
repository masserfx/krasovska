import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

interface SeedTask {
  title: string;
  type?: "task" | "milestone" | "goal";
  priority: "high" | "medium" | "low";
  assignee: string | null;
  sort_order: number;
}

const SEED_TASKS_BY_PHASE: Record<number, SeedTask[]> = {
  // ── Phase 0: Quick Start (02-03/2026) ──
  0: [
    // Milestones
    { title: "Varianta B schválena", type: "milestone", priority: "high", assignee: "Tomáš Knopp", sort_order: 0 },
    { title: "Vybavení objednáno", type: "milestone", priority: "high", assignee: "Tomáš Knopp", sort_order: 1 },
    // Goals
    { title: "Rozpočet 220K uvolněn", type: "goal", priority: "high", assignee: "Tomáš Knopp", sort_order: 2 },
    // Tasks
    { title: "Rozhodnutí: spustit Quick Start", priority: "high", assignee: "Tomáš Knopp", sort_order: 3 },
    { title: "Schválit rozpočet 220 tis. Kč na Variantu B", priority: "high", assignee: "Tomáš Knopp", sort_order: 4 },
    { title: "Ověřit ŽL – hostinská činnost", priority: "high", assignee: "Tomáš Knopp", sort_order: 5 },
    { title: "Objednat HACCP dokumentaci u konzultanta", priority: "high", assignee: "HACCP konzultant", sort_order: 6 },
    { title: "Kontaktovat KHS Plzeň — informovat o záměru", priority: "high", assignee: "Tomáš Knopp", sort_order: 7 },
    { title: "Zajistit revizi elektro a plynu", priority: "medium", assignee: "Servisní technik", sort_order: 8 },
    { title: "Zdravotní průkazy — objednat termíny", priority: "medium", assignee: "Vedoucí bistra", sort_order: 9 },
    { title: "Zveřejnit inzerát na kuchaře", priority: "high", assignee: "Tomáš Knopp", sort_order: 10 },
    { title: "Objednat POS systém Dotykačka KOMPLET", priority: "high", assignee: "Tomáš Knopp", sort_order: 11 },
    { title: "Kontaktovat Plzeňský Prazdroj — smlouva", priority: "medium", assignee: "Tomáš Knopp", sort_order: 12 },
    { title: "Uzavřít smlouvy s dodavateli (Makro, Bidfood)", priority: "medium", assignee: "Tomáš Knopp", sort_order: 13 },
    { title: "Objednat konvektomat / troubu", priority: "high", assignee: "Tomáš Knopp", sort_order: 14 },
    { title: "Objednat chladicí vitrínu", priority: "medium", assignee: null, sort_order: 15 },
    { title: "Nákup drobného vybavení kuchyně", priority: "medium", assignee: null, sort_order: 16 },
    { title: "Grafika menu, cedule, tabule — zadání", priority: "low", assignee: "Grafik / Marketing", sort_order: 17 },
    { title: "Nábor 1–2 brigádníků", priority: "medium", assignee: "Tomáš Knopp", sort_order: 18 },
    { title: "Nákup v Makro — počáteční zásoby", priority: "high", assignee: null, sort_order: 19 },
  ],

  // ── Phase 1: MVP → Standard (04/2026) ──
  1: [
    // Milestones
    { title: "Vybavení instalováno + HACCP hotovo", type: "milestone", priority: "high", assignee: null, sort_order: 0 },
    // Goals
    { title: "Všichni mají zdravotní průkazy", type: "goal", priority: "high", assignee: "Vedoucí bistra", sort_order: 1 },
    // Tasks
    { title: "Instalace konvektomatu a trouby", priority: "high", assignee: "Servisní technik", sort_order: 2 },
    { title: "Instalace chladicí vitríny", priority: "high", assignee: "Servisní technik", sort_order: 3 },
    { title: "Instalace čepování (pivovar)", priority: "medium", assignee: "Pivovar", sort_order: 4 },
    { title: "Nástup kuchaře — zahájení HPP", priority: "high", assignee: "Kuchař", sort_order: 5 },
    { title: "POS konfigurace — menu, ceny, DPH", priority: "high", assignee: "IT", sort_order: 6 },
    { title: "Nastavení skladu a receptur v POS", priority: "medium", assignee: "Kuchař", sort_order: 7 },
    { title: "HACCP kompletace a finalizace", priority: "high", assignee: "HACCP konzultant", sort_order: 8 },
    { title: "Školení personálu — hygiena, obsluha, POS", priority: "high", assignee: "Vedoucí bistra", sort_order: 9 },
    { title: "Testovací vaření — ověření receptur", priority: "medium", assignee: "Kuchař", sort_order: 10 },
    { title: "KHS kontrola provozovny", priority: "high", assignee: "KHS Plzeň", sort_order: 11 },
    { title: "Nábor brigádníků — pohovory a výběr", priority: "medium", assignee: "Vedoucí bistra", sort_order: 12 },
    { title: "Školení brigádníků", priority: "medium", assignee: "Vedoucí bistra", sort_order: 13 },
    { title: "Online menu na webu", priority: "medium", assignee: "IT", sort_order: 14 },
    { title: "Pojištění provozovny — uzavřít", priority: "medium", assignee: "Tomáš Knopp", sort_order: 15 },
    { title: "OSA / Intergram licence", priority: "low", assignee: "Vedoucí bistra", sort_order: 16 },
    { title: "Připravit ceník (tabule / tisk)", priority: "low", assignee: "Grafik / Marketing", sort_order: 17 },
    { title: "Nákup nádobí, příborů, servírovacích pomůcek", priority: "medium", assignee: null, sort_order: 18 },
    { title: "Evidence tržeb — ověřit nastavení EET/DPH", priority: "medium", assignee: "IT", sort_order: 19 },
    { title: "Smlouva na svoz odpadu", priority: "low", assignee: "Tomáš Knopp", sort_order: 20 },
  ],

  // ── Phase 2: Standard → Full (05-06/2026) ──
  2: [
    // Milestones
    { title: "Soft opening pro členy", type: "milestone", priority: "high", assignee: null, sort_order: 0 },
    { title: "Grand opening", type: "milestone", priority: "high", assignee: null, sort_order: 1 },
    // Goals
    { title: "Tržby 100K/měsíc", type: "goal", priority: "high", assignee: null, sort_order: 2 },
    { title: "Food cost < 35%", type: "goal", priority: "medium", assignee: "Kuchař", sort_order: 3 },
    { title: "Google 4.0★", type: "goal", priority: "medium", assignee: null, sort_order: 4 },
    // Tasks
    { title: "Soft opening — testovací provoz pro členy", priority: "high", assignee: "Vedoucí bistra", sort_order: 5 },
    { title: "Sběr feedbacku od prvních zákazníků", priority: "medium", assignee: "Vedoucí bistra", sort_order: 6 },
    { title: "Úprava menu dle zpětné vazby", priority: "medium", assignee: "Kuchař", sort_order: 7 },
    { title: "Zkušební provoz — 2 týdny plný sortiment", priority: "high", assignee: "Vedoucí bistra", sort_order: 8 },
    { title: "Rozšíření na plný provoz", priority: "high", assignee: "Tomáš Knopp", sort_order: 9 },
    { title: "Turnajový catering — první test (víkend)", priority: "high", assignee: "Kuchař", sort_order: 10 },
    { title: "Grand opening — slavnostní otevření", priority: "high", assignee: "Tomáš Knopp", sort_order: 11 },
    { title: "Marketingová kampaň — FB, IG, lokální média", priority: "medium", assignee: "Grafik / Marketing", sort_order: 12 },
    { title: "Věrnostní program — spuštění", priority: "medium", assignee: "Vedoucí bistra", sort_order: 13 },
    { title: "Wolt registrace — zahájit onboarding", priority: "medium", assignee: "IT", sort_order: 14 },
    { title: "Bolt Food registrace", priority: "medium", assignee: "IT", sort_order: 15 },
    { title: "Google My Business — založit profil", priority: "medium", assignee: "Grafik / Marketing", sort_order: 16 },
    { title: "Social media oznámení — plný provoz", priority: "low", assignee: "Grafik / Marketing", sort_order: 17 },
    { title: "První měsíční reporting (tržby, food cost)", priority: "high", assignee: "Vedoucí bistra", sort_order: 18 },
    { title: "Ochutnávky zdarma pro členy (promo akce)", priority: "low", assignee: "Kuchař", sort_order: 19 },
  ],

  // ── Phase 3: Full Operace (07-12/2026) ──
  3: [
    // Milestones
    { title: "3 měsíce provozu vyhodnoceny", type: "milestone", priority: "high", assignee: null, sort_order: 0 },
    { title: "Break-even dosažen", type: "milestone", priority: "high", assignee: null, sort_order: 1 },
    // Goals
    { title: "Tržby 5 000 Kč/den", type: "goal", priority: "high", assignee: null, sort_order: 2 },
    { title: "Food cost ≤ 32%", type: "goal", priority: "high", assignee: "Kuchař", sort_order: 3 },
    { title: "40 zákazníků/den", type: "goal", priority: "medium", assignee: null, sort_order: 4 },
    // Tasks
    { title: "Stabilizace provozu — rutinní procesy", priority: "high", assignee: "Vedoucí bistra", sort_order: 5 },
    { title: "Letní menu — sezonní úprava", priority: "medium", assignee: "Kuchař", sort_order: 6 },
    { title: "Catering pro letní kempy", priority: "high", assignee: "Kuchař", sort_order: 7 },
    { title: "Food cost analýza — měsíční sledování", priority: "high", assignee: "Vedoucí bistra", sort_order: 8 },
    { title: "Finanční vyhodnocení po 3 měsících", priority: "high", assignee: "Tomáš Knopp", sort_order: 9 },
    { title: "Rozhodnutí: pokračovat / rozšířit / optimalizovat", priority: "high", assignee: "Tomáš Knopp", sort_order: 10 },
    { title: "Posouzení přechodu na Variantu C", priority: "medium", assignee: "Tomáš Knopp", sort_order: 11 },
    { title: "Back to Sport — podzimní akce (září)", priority: "medium", assignee: "Grafik / Marketing", sort_order: 12 },
    { title: "Halloween menu / party (říjen)", priority: "low", assignee: "Kuchař", sort_order: 13 },
    { title: "Vánoční turnaje — catering příprava", priority: "high", assignee: "Kuchař", sort_order: 14 },
    { title: "Vánoční menu a svařák (prosinec)", priority: "medium", assignee: "Kuchař", sort_order: 15 },
    { title: "Roční vyhodnocení bistra", priority: "high", assignee: "Tomáš Knopp", sort_order: 16 },
    { title: "Optimalizace dodavatelských smluv", priority: "medium", assignee: "Vedoucí bistra", sort_order: 17 },
    { title: "Wolt/Bolt — vyhodnocení marží z delivery", priority: "medium", assignee: "Vedoucí bistra", sort_order: 18 },
    { title: "Salonky — marketing a cross-promo", priority: "low", assignee: "Grafik / Marketing", sort_order: 19 },
  ],
};

async function seedTasks() {
  // Get all phases
  const { rows: phases } = await sql`SELECT id, phase_number FROM bistro_phases ORDER BY phase_number ASC`;
  if (phases.length === 0) return;

  for (const phase of phases) {
    const tasks = SEED_TASKS_BY_PHASE[phase.phase_number];
    if (!tasks) continue;

    for (const t of tasks) {
      await sql`
        INSERT INTO bistro_tasks (phase_id, title, type, priority, assignee, sort_order, status)
        VALUES (${phase.id}, ${t.title}, ${t.type ?? "task"}, ${t.priority}, ${t.assignee}, ${t.sort_order}, ${"todo"})
      `;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get("phase_id");
    const reseed = searchParams.get("reseed");

    // Reseed: delete all tasks and re-create
    if (reseed === "true") {
      await sql`DELETE FROM bistro_tasks`;
      await seedTasks();
      const { rows } = await sql`SELECT * FROM bistro_tasks ORDER BY sort_order ASC, created_at ASC`;
      return NextResponse.json({ reseeded: true, count: rows.length, tasks: rows });
    }

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
