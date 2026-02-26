import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET() {
  try {
    await ensureTable();
    const { rows } = await sql`
      SELECT id, title, created_at, updated_at
      FROM questionnaires
      ORDER BY updated_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/questionnaires error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst dotazníky" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const { title } = await request.json();
    const { rows } = await sql`
      INSERT INTO questionnaires (title)
      VALUES (${title || "Nový dotazník"})
      RETURNING id
    `;
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/questionnaires error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se vytvořit dotazník" },
      { status: 500 }
    );
  }
}
