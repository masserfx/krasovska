/**
 * Plane PM links for each project section.
 * Used for backlinks from production app to Plane issue tracker.
 */

export const PLANE_BASE = "http://46.225.31.161/krasovska/projects";

/** Static links for dedicated project pages (bistro, eshop, eos) */
export const PLANE_LINKS: Record<string, string> = {
  bistro: `${PLANE_BASE}/c7f73e13-5bf2-405e-a952-3cccf2177f19/issues/`,
  eshop: `${PLANE_BASE}/92793297-f6eb-498b-87d3-2f9f4cd7ff34/issues/`,
  eos: `${PLANE_BASE}/2fec08e8-eb48-4eaa-b991-71f30f5cbc7c/issues/`,
  salonky: `${PLANE_BASE}/1addbff0-cc91-4308-9063-262e6ee3fad3/issues/`,
};

/** Generate Plane link for any project by ID */
export function planeLinkForProject(projectId: string): string {
  return `${PLANE_BASE}/${projectId}/issues/`;
}
