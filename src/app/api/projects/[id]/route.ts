import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("member");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { id } = await params;
    const role = auth.role;

    const { rows } = await sql`
      SELECT p.*,
             COUNT(t.id)::int AS task_count,
             COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.id = ${id}
        AND (p.visibility = 'all'
          OR (p.visibility = 'management' AND ${role} IN ('admin', 'coordinator'))
          OR ${role} = 'admin')
      GROUP BY p.id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("member");
  if (isAuthError(auth)) return auth;

  try {
    await ensureTable();
    const { id } = await params;
    const body = await request.json();

    const { rows: current } = await sql`SELECT * FROM projects WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = current[0];
    const title = body.title ?? project.title;
    const description = body.description ?? project.description;
    const category = body.category ?? project.category;
    const status = body.status ?? project.status;
    const priority = body.priority ?? project.priority;
    const questionnaire_id = body.questionnaire_id ?? project.questionnaire_id;
    const due_date = body.due_date ?? project.due_date;

    // Only management can change visibility
    const canSetVisibility = auth.role === "admin" || auth.role === "coordinator";
    const visibility = (canSetVisibility && body.visibility) ? body.visibility : project.visibility;

    const { rows } = await sql`
      UPDATE projects
      SET title = ${title},
          description = ${description},
          category = ${category},
          status = ${status},
          priority = ${priority},
          questionnaire_id = ${questionnaire_id},
          due_date = ${due_date},
          visibility = ${visibility},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rowCount } = await sql`DELETE FROM projects WHERE id = ${id}`;

    if (rowCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
