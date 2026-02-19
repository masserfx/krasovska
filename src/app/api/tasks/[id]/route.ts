import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

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

    const { rows: current } = await sql`SELECT * FROM tasks WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = current[0];
    const title = body.title ?? task.title;
    const description = body.description ?? task.description;
    const status = body.status ?? task.status;
    const priority = body.priority ?? task.priority;
    const assignee = body.assignee ?? task.assignee;
    const due_date = body.due_date ?? task.due_date;
    const sort_order = body.sort_order ?? task.sort_order;

    const canSetVisibility = auth.role === "admin" || auth.role === "coordinator";
    const visibility = (canSetVisibility && body.visibility) ? body.visibility : task.visibility;

    const { rows } = await sql`
      UPDATE tasks
      SET title = ${title},
          description = ${description},
          status = ${status},
          priority = ${priority},
          assignee = ${assignee},
          due_date = ${due_date},
          sort_order = ${sort_order},
          visibility = ${visibility},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rowCount } = await sql`DELETE FROM tasks WHERE id = ${id}`;

    if (rowCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
