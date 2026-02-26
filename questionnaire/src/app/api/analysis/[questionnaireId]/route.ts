import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";
import { generateAnalysis } from "@/lib/analysis";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    await ensureTable();
    const { questionnaireId } = await params;

    // Check for existing snapshot
    const { rows: snapshots } = await sql`
      SELECT * FROM analysis_snapshots
      WHERE questionnaire_id = ${questionnaireId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (snapshots.length > 0) {
      return NextResponse.json(snapshots[0]);
    }

    // No snapshot exists — generate one
    const { rows: questionnaires } = await sql`
      SELECT data FROM questionnaires WHERE id = ${questionnaireId}
    `;

    if (questionnaires.length === 0) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
    }

    const formData = questionnaires[0].data;
    const analysis = generateAnalysis(formData);

    const { rows: created } = await sql`
      INSERT INTO analysis_snapshots (questionnaire_id, data)
      VALUES (${questionnaireId}, ${JSON.stringify(analysis)})
      RETURNING *
    `;

    return NextResponse.json(created[0]);
  } catch (error) {
    console.error("GET /api/analysis/[questionnaireId] error:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    await ensureTable();
    const { questionnaireId } = await params;

    // Load questionnaire data
    const { rows: questionnaires } = await sql`
      SELECT data FROM questionnaires WHERE id = ${questionnaireId}
    `;

    if (questionnaires.length === 0) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 });
    }

    const formData = questionnaires[0].data;
    const analysis = generateAnalysis(formData);

    // Insert new snapshot (keeps history)
    const { rows: created } = await sql`
      INSERT INTO analysis_snapshots (questionnaire_id, data)
      VALUES (${questionnaireId}, ${JSON.stringify(analysis)})
      RETURNING *
    `;

    return NextResponse.json(created[0]);
  } catch (error) {
    console.error("POST /api/analysis/[questionnaireId] error:", error);
    return NextResponse.json({ error: "Failed to regenerate analysis" }, { status: 500 });
  }
}
