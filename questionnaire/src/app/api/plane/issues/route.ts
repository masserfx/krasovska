import { NextRequest, NextResponse } from "next/server";

const PLANE_API =
  process.env.PLANE_API_URL ||
  "http://46.225.31.161/api/v1/workspaces/krasovska";
const PLANE_API_KEY =
  process.env.PLANE_API_KEY ||
  "plane_api_c3b023ea27254bfc8979a6d787dd7e0e";

async function planeRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PLANE_API}${path}`, {
    ...options,
    headers: {
      "x-api-key": PLANE_API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw { status: res.status, message: err };
  }
  return res.json();
}

/**
 * GET /api/plane/issues?project_id=X&issue_id=Y
 * Fetch single issue with comments.
 */
export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("project_id");
  const issueId = request.nextUrl.searchParams.get("issue_id");

  if (!projectId || !issueId) {
    return NextResponse.json(
      { error: "Missing project_id or issue_id" },
      { status: 400 }
    );
  }

  try {
    const issue = await planeRequest(
      `/projects/${projectId}/issues/${issueId}/`
    );

    // Plane v1 includes comments[] in issue detail.
    // Fetch separately only if missing.
    if (!issue.comments) {
      try {
        const commentsData = await planeRequest(
          `/projects/${projectId}/issues/${issueId}/comments/`
        );
        issue.comments = Array.isArray(commentsData)
          ? commentsData
          : commentsData.results || [];
      } catch {
        issue.comments = [];
      }
    }

    return NextResponse.json(issue);
  } catch (error: unknown) {
    const e = error as { status?: number; message?: string };
    console.error("[Plane Issue GET]", error);
    return NextResponse.json(
      { error: e.message || "Failed to fetch issue" },
      { status: e.status || 502 }
    );
  }
}

/**
 * PATCH /api/plane/issues?project_id=X&issue_id=Y
 * Update issue fields (state, priority, dates, etc.).
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
    const data = await planeRequest(
      `/projects/${projectId}/issues/${issueId}/`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const e = error as { status?: number; message?: string };
    console.error("[Plane Issue PATCH]", error);
    return NextResponse.json(
      { error: e.message || "Failed to update issue" },
      { status: e.status || 502 }
    );
  }
}

/**
 * POST /api/plane/issues?project_id=X&issue_id=Y
 * Add comment to an issue.
 */
export async function POST(request: NextRequest) {
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
    const data = await planeRequest(
      `/projects/${projectId}/issues/${issueId}/comments/`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const e = error as { status?: number; message?: string };
    console.error("[Plane Issue POST comment]", error);
    return NextResponse.json(
      { error: e.message || "Failed to add comment" },
      { status: e.status || 502 }
    );
  }
}
