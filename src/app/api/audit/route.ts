import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const searchParams = request.nextUrl.searchParams;
    const questionnaireId = searchParams.get("questionnaire_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    let result;
    if (questionnaireId) {
      result = await sql`
        SELECT a.*, q.title as questionnaire_title
        FROM audit_log a
        LEFT JOIN questionnaires q ON q.id = a.questionnaire_id
        WHERE a.questionnaire_id = ${questionnaireId}
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT a.*, q.title as questionnaire_title
        FROM audit_log a
        LEFT JOIN questionnaires q ON q.id = a.questionnaire_id
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/audit error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání audit logu" },
      { status: 500 }
    );
  }
}
