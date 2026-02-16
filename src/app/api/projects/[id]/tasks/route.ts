import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rows } = await sql`
      SELECT * FROM tasks
      WHERE project_id = ${id}
      ORDER BY sort_order ASC, created_at ASC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    const body = await request.json();

    const { title, description, status, priority, assignee, due_date, sort_order } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Verify the project exists
    const { rows: projectRows } = await sql`SELECT id FROM projects WHERE id = ${id}`;
    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { rows } = await sql`
      INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date, sort_order)
      VALUES (${id}, ${title}, ${description || null}, ${status || "todo"}, ${priority || "medium"}, ${assignee || null}, ${due_date || null}, ${sort_order ?? 0})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
