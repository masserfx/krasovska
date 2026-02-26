import { NextRequest, NextResponse } from "next/server";
import {
  fetchPlaneProjects,
  fetchProjectStats,
  fetchAllIssues,
  fetchStates,
  fetchLabels,
  fetchModules,
} from "@/lib/plane-api";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  try {
    const allProjects = await fetchPlaneProjects();

    if (key) {
      const proj = allProjects.find((p) => p.key === key);
      if (!proj) {
        return NextResponse.json(
          { error: `Project "${key}" not found` },
          { status: 404 }
        );
      }

      // Single project with full issue list
      const [stats, issues, states, labels, modules] = await Promise.all([
        fetchProjectStats(proj),
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
        states,
      });
    }

    // All projects (summary only)
    const projects = await Promise.all(
      allProjects.map((p) => fetchProjectStats(p))
    );
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[Plane Projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch Plane data" },
      { status: 502 }
    );
  }
}
