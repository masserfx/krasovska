/**
 * Server-side Plane API client with Next.js fetch cache.
 * All data is cached for 5 minutes via Next.js Data Cache (ISR).
 */

const PLANE_API =
  process.env.PLANE_API_URL ||
  "http://46.225.31.161/api/v1/workspaces/krasovska";
const PLANE_API_KEY =
  process.env.PLANE_API_KEY ||
  "plane_api_c3b023ea27254bfc8979a6d787dd7e0e";

const CACHE_TTL = 300; // 5 minutes

// --- Dynamic projects from Plane API ---

export interface PlaneProject {
  id: string;
  name: string;
  identifier: string;
  description: string;
  emoji: string | null;
  logo_props: Record<string, unknown> | null;
  created_at: string;
}

const PROJECT_COLORS = [
  "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

let _projectsCache: { data: PlaneProjectEntry[]; ts: number } | null = null;

export interface PlaneProjectEntry {
  key: string;
  id: string;
  name: string;
  prefix: string;
  color: string;
  description: string;
}

export async function fetchPlaneProjects(): Promise<PlaneProjectEntry[]> {
  const now = Date.now();
  if (_projectsCache && now - _projectsCache.ts < CACHE_TTL * 1000) {
    return _projectsCache.data;
  }

  const data = await planeGet<{ results: PlaneProject[] } | PlaneProject[]>(
    "/projects/"
  );
  const projects = Array.isArray(data) ? data : data.results;

  const entries: PlaneProjectEntry[] = projects
    .filter((p) => !p.name.startsWith("_")) // skip internal projects
    .map((p, i) => ({
      key: p.identifier.toLowerCase(),
      id: p.id,
      name: p.name,
      prefix: p.identifier,
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
      description: p.description || "",
    }));

  _projectsCache = { data: entries, ts: now };
  return entries;
}

export type PlaneProjectKey = string;

export const CALENDAR_URL =
  "http://46.225.31.161:5555/calendar/krasovska.ics?token=gtQLkawoAcZyRj8X9QrpZo9JHQs7hyN9-q4BmwrUKTI";

export const PLANE_UI_BASE = "http://46.225.31.161/krasovska/projects";

// --- Low-level fetch ---

async function planeGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${PLANE_API}${path}`, {
    headers: { "x-api-key": PLANE_API_KEY },
    next: { revalidate: CACHE_TTL },
  });
  if (!res.ok) {
    throw new Error(`Plane API ${res.status}: ${path}`);
  }
  return res.json();
}

// --- Issues ---

export interface PlaneIssue {
  id: string;
  sequence_id: number;
  name: string;
  description_html: string | null;
  state: string;
  labels: string[];
  start_date: string | null;
  target_date: string | null;
  assignees: string[];
  priority: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchAllIssues(
  projectId: string
): Promise<PlaneIssue[]> {
  const all: PlaneIssue[] = [];
  let page = 1;
  while (true) {
    const data = await planeGet<{
      results: PlaneIssue[];
      next_page_results: boolean;
    }>(`/projects/${projectId}/issues/?per_page=100&page=${page}`);
    all.push(...data.results);
    if (!data.next_page_results) break;
    page++;
  }
  return all;
}

// --- States ---

export interface PlaneState {
  id: string;
  name: string;
  group: string; // backlog | unstarted | started | completed | cancelled
  color: string;
}

export async function fetchStates(
  projectId: string
): Promise<PlaneState[]> {
  const data = await planeGet<PlaneState[] | { results: PlaneState[] }>(
    `/projects/${projectId}/states/`
  );
  return Array.isArray(data) ? data : data.results;
}

// --- Labels ---

export interface PlaneLabel {
  id: string;
  name: string;
  color: string;
}

export async function fetchLabels(
  projectId: string
): Promise<PlaneLabel[]> {
  const data = await planeGet<PlaneLabel[] | { results: PlaneLabel[] }>(
    `/projects/${projectId}/labels/`
  );
  return Array.isArray(data) ? data : data.results;
}

// --- Modules ---

export interface PlaneModule {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  status: string;
}

export async function fetchModules(
  projectId: string
): Promise<PlaneModule[]> {
  const data = await planeGet<PlaneModule[] | { results: PlaneModule[] }>(
    `/projects/${projectId}/modules/`
  );
  return Array.isArray(data) ? data : data.results;
}

// --- Aggregated project data ---

export interface ProjectStats {
  key: PlaneProjectKey;
  id: string;
  name: string;
  prefix: string;
  color: string;
  description: string;
  total: number;
  done: number;
  wip: number;
  todo: number;
  cancelled: number;
  progress: number;
  modules: {
    name: string;
    status: string;
    startDate: string | null;
    targetDate: string | null;
  }[];
  milestones: {
    seq: number;
    name: string;
    targetDate: string | null;
    state: string;
  }[];
  goals: {
    seq: number;
    name: string;
    targetDate: string | null;
    state: string;
  }[];
  upcoming: {
    seq: number;
    name: string;
    targetDate: string;
    type: string;
    state: string;
    stateGroup: string;
  }[];
}

export async function fetchProjectStats(
  proj: PlaneProjectEntry
): Promise<ProjectStats> {
  const key = proj.key;
  const [issues, states, labels, modules] = await Promise.all([
    fetchAllIssues(proj.id),
    fetchStates(proj.id),
    fetchLabels(proj.id),
    fetchModules(proj.id),
  ]);

  const stateMap = new Map(states.map((s) => [s.id, s]));
  const labelMap = new Map(labels.map((l) => [l.id, l.name.toLowerCase()]));

  let done = 0,
    wip = 0,
    todo = 0,
    cancelled = 0;

  const milestones: ProjectStats["milestones"] = [];
  const goals: ProjectStats["goals"] = [];
  const upcoming: ProjectStats["upcoming"] = [];

  const today = new Date().toISOString().slice(0, 10);
  const in14days = new Date(Date.now() + 14 * 86400000)
    .toISOString()
    .slice(0, 10);

  for (const issue of issues) {
    const state = stateMap.get(issue.state);
    const group = state?.group || "unstarted";

    if (group === "completed") done++;
    else if (group === "started") wip++;
    else if (group === "cancelled") cancelled++;
    else todo++;

    // Label-based type
    let type = "task";
    for (const lid of issue.labels) {
      const ln = labelMap.get(lid);
      if (ln === "milestone" || ln === "goal") {
        type = ln;
        break;
      }
    }

    if (type === "milestone") {
      milestones.push({
        seq: issue.sequence_id,
        name: issue.name,
        targetDate: issue.target_date,
        state: state?.name || "Unknown",
      });
    }
    if (type === "goal") {
      goals.push({
        seq: issue.sequence_id,
        name: issue.name,
        targetDate: issue.target_date,
        state: state?.name || "Unknown",
      });
    }

    // Upcoming (next 14 days, not completed/cancelled)
    if (
      issue.target_date &&
      issue.target_date >= today &&
      issue.target_date <= in14days &&
      group !== "completed" &&
      group !== "cancelled"
    ) {
      upcoming.push({
        seq: issue.sequence_id,
        name: issue.name,
        targetDate: issue.target_date,
        type,
        state: state?.name || "Unknown",
        stateGroup: group,
      });
    }
  }

  upcoming.sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  const total = issues.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    key,
    id: proj.id,
    name: proj.name,
    prefix: proj.prefix,
    color: proj.color,
    description: proj.description,
    total,
    done,
    wip,
    todo,
    cancelled,
    progress,
    modules: modules.map((m) => ({
      name: m.name,
      status: m.status,
      startDate: m.start_date,
      targetDate: m.target_date,
    })),
    milestones,
    goals,
    upcoming,
  };
}

// --- Full dashboard data ---

export interface DashboardPlaneData {
  projects: ProjectStats[];
  totals: {
    issues: number;
    done: number;
    wip: number;
    todo: number;
    progress: number;
  };
  upcoming: (ProjectStats["upcoming"][number] & {
    project: string;
    prefix: string;
  })[];
  milestones: (ProjectStats["milestones"][number] & {
    project: string;
    prefix: string;
  })[];
}

export async function fetchDashboardData(): Promise<DashboardPlaneData> {
  const allProjects = await fetchPlaneProjects();
  const projects = await Promise.all(allProjects.map((p) => fetchProjectStats(p)));

  const totals = {
    issues: 0,
    done: 0,
    wip: 0,
    todo: 0,
    progress: 0,
  };

  const allUpcoming: DashboardPlaneData["upcoming"] = [];
  const allMilestones: DashboardPlaneData["milestones"] = [];

  for (const p of projects) {
    totals.issues += p.total;
    totals.done += p.done;
    totals.wip += p.wip;
    totals.todo += p.todo;

    for (const u of p.upcoming) {
      allUpcoming.push({ ...u, project: p.name, prefix: p.prefix });
    }
    for (const m of p.milestones) {
      allMilestones.push({ ...m, project: p.name, prefix: p.prefix });
    }
  }

  totals.progress =
    totals.issues > 0
      ? Math.round((totals.done / totals.issues) * 100)
      : 0;

  allUpcoming.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  allMilestones.sort((a, b) =>
    (a.targetDate || "").localeCompare(b.targetDate || "")
  );

  return { projects, totals, upcoming: allUpcoming, milestones: allMilestones };
}
