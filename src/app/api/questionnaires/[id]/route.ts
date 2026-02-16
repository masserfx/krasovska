import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    const { rows } = await sql`
      SELECT id, title, data, created_at, updated_at
      FROM questionnaires WHERE id = ${id}
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Dotazník nenalezen" },
        { status: 404 }
      );
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/questionnaires/[id] error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání dotazníku" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    const { data, title } = await request.json();

    if (title !== undefined) {
      await sql`
        UPDATE questionnaires
        SET data = ${JSON.stringify(data)}, title = ${title}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE questionnaires
        SET data = ${JSON.stringify(data)}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/questionnaires/[id] error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se uložit dotazník" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    await sql`DELETE FROM questionnaires WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/questionnaires/[id] error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat dotazník" },
      { status: 500 }
    );
  }
}
