import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { generateAnalysis } from "@/lib/analysis";
import { DashboardData, ProjectCategory } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    await ensureTable();
    const { questionnaireId } = await params;

    // Stats: total projects, tasks, done tasks, overdue tasks
    const { rows: statsRows } = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM projects WHERE questionnaire_id = ${questionnaireId}) AS total_projects,
        (SELECT COUNT(*)::int FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.questionnaire_id = ${questionnaireId}) AS total_tasks,
        (SELECT COUNT(*)::int FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.questionnaire_id = ${questionnaireId} AND t.status = 'done') AS done_tasks,
        (SELECT COUNT(*)::int FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.questionnaire_id = ${questionnaireId}
           AND t.status != 'done'
           AND t.due_date < CURRENT_DATE) AS overdue_tasks
    `;

    // Projects by category
    const { rows: categoryRows } = await sql`
      SELECT category, COUNT(*)::int AS count
      FROM projects
      WHERE questionnaire_id = ${questionnaireId}
      GROUP BY category
    `;

    const categories: ProjectCategory[] = ["strategic", "marketing", "operations", "development", "infrastructure"];
    const projectsByCategory = Object.fromEntries(
      categories.map((c) => [c, 0])
    ) as Record<ProjectCategory, number>;
    for (const row of categoryRows) {
      if (row.category in projectsByCategory) {
        projectsByCategory[row.category as ProjectCategory] = row.count;
      }
    }

    // Recent projects (last 5) with task counts
    const { rows: recentProjects } = await sql`
      SELECT p.*,
             COUNT(t.id)::int AS task_count,
             COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.questionnaire_id = ${questionnaireId}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    // Insights from latest analysis snapshot (or generate if none)
    let insights;
    const { rows: snapshots } = await sql`
      SELECT data FROM analysis_snapshots
      WHERE questionnaire_id = ${questionnaireId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (snapshots.length > 0) {
      insights = snapshots[0].data.insights || [];
    } else {
      // Try to generate analysis if questionnaire exists
      const { rows: questionnaires } = await sql`
        SELECT data FROM questionnaires WHERE id = ${questionnaireId}
      `;
      if (questionnaires.length > 0) {
        const analysis = generateAnalysis(questionnaires[0].data);
        // Save the snapshot for future use
        await sql`
          INSERT INTO analysis_snapshots (questionnaire_id, data)
          VALUES (${questionnaireId}, ${JSON.stringify(analysis)})
        `;
        insights = analysis.insights;
      } else {
        insights = [];
      }
    }

    const dashboard: DashboardData = {
      stats: statsRows[0] as DashboardData["stats"],
      projects_by_category: projectsByCategory,
      recent_projects: recentProjects as unknown as DashboardData["recent_projects"],
      insights,
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("GET /api/dashboard/[questionnaireId] error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
