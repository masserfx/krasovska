import { NextRequest, NextResponse } from "next/server";
import {
  PLANE_PROJECTS,
  fetchProjectStats,
  fetchAllIssues,
  fetchStates,
  fetchLabels,
  fetchModules,
  type PlaneProjectKey,
} from "@/lib/plane-api";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") as PlaneProjectKey | null;

  try {
    if (key && key in PLANE_PROJECTS) {
      // Single project with full issue list
      const proj = PLANE_PROJECTS[key];
      const [stats, issues, states, labels, modules] = await Promise.all([
        fetchProjectStats(key),
        fetchAllIssues(proj.id),
        fetchStates(proj.id),
        fetchLabels(proj.id),
        fetchModules(proj.id),
      ]);

      const stateMap = Object.fromEntries(
        states.map((s) => [s.id, { name: s.name, group: s.group, color: s.color }])
      );
      const labelMap = Object.fromEntries(
        labels.map((l) => [l.id, { name: l.name, color: l.color }])
      );

      // Enrich issues with resolved state/label names
      const enrichedIssues = issues.map((i) => {
        const state = stateMap[i.state];
        const issueLabels = i.labels.map((lid) => labelMap[lid]).filter(Boolean);
        return {
          ...i,
          stateName: state?.name || "Unknown",
          stateGroup: state?.group || "unstarted",
          stateColor: state?.color || "#999",
          labelNames: issueLabels,
        };
      });

      return NextResponse.json({
        ...stats,
        issues: enrichedIssues,
        modules,
      });
    }

    // All projects (summary only)
    const keys = Object.keys(PLANE_PROJECTS) as PlaneProjectKey[];
    const projects = await Promise.all(keys.map((k) => fetchProjectStats(k)));
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[Plane Projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch Plane data" },
      { status: 502 }
    );
  }
}
