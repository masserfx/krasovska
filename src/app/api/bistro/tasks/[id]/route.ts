import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;
    const body = await request.json();

    const { rows: current } = await sql`SELECT * FROM bistro_tasks WHERE id = ${id}`;
    if (current.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = current[0];
    const title = body.title ?? task.title;
    const description = body.description !== undefined ? body.description : task.description;
    const type = body.type ?? task.type ?? "task";
    const priority = body.priority ?? task.priority;
    const assignee = body.assignee !== undefined ? body.assignee : task.assignee;
    const due_date = body.due_date !== undefined ? body.due_date : task.due_date;
    const sort_order = body.sort_order ?? task.sort_order;

    // Track completion time
    const newStatus = body.status ?? task.status;
    const wasCompleted = task.status !== "done" && newStatus === "done";
    const completed_at = wasCompleted ? new Date().toISOString() : (newStatus !== "done" ? null : task.completed_at);

    const { rows } = await sql`
      UPDATE bistro_tasks
      SET title = ${title},
          description = ${description},
          type = ${type},
          status = ${newStatus},
          priority = ${priority},
          assignee = ${assignee},
          due_date = ${due_date},
          sort_order = ${sort_order},
          completed_at = ${completed_at},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PATCH /api/bistro/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update bistro task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rowCount } = await sql`DELETE FROM bistro_tasks WHERE id = ${id}`;

    if (rowCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bistro/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete bistro task" }, { status: 500 });
  }
}
