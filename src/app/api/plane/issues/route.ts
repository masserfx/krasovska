import { NextRequest, NextResponse } from "next/server";

const PLANE_API =
  process.env.PLANE_API_URL ||
  "http://46.225.31.161/api/v1/workspaces/krasovska";
const PLANE_API_KEY =
  process.env.PLANE_API_KEY ||
  "plane_api_c3b023ea27254bfc8979a6d787dd7e0e";

/**
 * PATCH /api/plane/issues?project_id=X&issue_id=Y
 * Update issue state in Plane (used by Kanban drag & drop).
 */
export async function PATCH(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("project_id");
  const issueId = request.nextUrl.searchParams.get("issue_id");

  if (!projectId || !issueId) {
    return NextResponse.json(
      { error: "Missing project_id or issue_id" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const res = await fetch(
      `${PLANE_API}/projects/${projectId}/issues/${issueId}/`,
      {
        method: "PATCH",
        headers: {
          "x-api-key": PLANE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Plane API ${res.status}: ${err}` },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    console.error("[Plane Issue PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 502 }
    );
  }
}
