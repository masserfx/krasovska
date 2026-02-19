import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const auth = await requireAuth("member");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const questionnaireId = searchParams.get("questionnaire_id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

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

    // Visibility filter — $N reused intentionally (valid in PostgreSQL)
    values.push(auth.role);
    const ri = values.length;
    conditions.push(
      `(p.visibility = 'all' OR (p.visibility = 'management' AND $${ri} IN ('admin', 'coordinator')) OR $${ri} = 'admin')`
    );

    const where = `WHERE ${conditions.join(" AND ")}`;

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
  const auth = await requireAuth("member");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();

    const body = await request.json();
    const { title, description, category, status, priority, questionnaire_id, due_date, visibility } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    // Only management can set restricted visibility
    const canSetVisibility = auth.role === "admin" || auth.role === "coordinator";
    const resolvedVisibility = canSetVisibility && visibility ? visibility : "all";

    const { rows } = await sql`
      INSERT INTO projects (title, description, category, status, priority, questionnaire_id, due_date, visibility)
      VALUES (${title}, ${description || null}, ${category}, ${status || "planned"}, ${priority || "medium"}, ${questionnaire_id || null}, ${due_date || null}, ${resolvedVisibility})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
