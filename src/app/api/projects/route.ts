import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const questionnaireId = searchParams.get("questionnaire_id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build WHERE conditions
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (questionnaireId) {
      values.push(questionnaireId);
      conditions.push(`p.questionnaire_id = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`p.category = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`p.status = $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await sql.query(
      `SELECT p.*,
              COUNT(t.id)::int AS task_count,
              COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      values
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { title, description, category, status, priority, questionnaire_id, due_date } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO projects (title, description, category, status, priority, questionnaire_id, due_date)
      VALUES (${title}, ${description || null}, ${category}, ${status || "planned"}, ${priority || "medium"}, ${questionnaire_id || null}, ${due_date || null})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
