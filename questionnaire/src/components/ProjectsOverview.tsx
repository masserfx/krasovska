import { Project, ProjectCategory, PROJECT_CATEGORY_LABELS } from "@/types";
import StatusBadge from "./StatusBadge";
import CategoryBadge from "./CategoryBadge";

const CATEGORY_BAR_COLORS: Record<ProjectCategory, string> = {
  strategic: "bg-purple-500",
  marketing: "bg-pink-500",
  operations: "bg-cyan-500",
  development: "bg-indigo-500",
  infrastructure: "bg-amber-500",
};

interface ProjectsOverviewProps {
  projects_by_category: Record<ProjectCategory, number>;
  recent_projects: Project[];
}

export default function ProjectsOverview({
  projects_by_category,
  recent_projects,
}: ProjectsOverviewProps) {
  const categories = Object.entries(projects_by_category) as [ProjectCategory, number][];
  const total = categories.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Přehled projektů
      </h2>

      {/* Category distribution bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-gray-100">
            {categories.map(([cat, count]) =>
              count > 0 ? (
                <div
                  key={cat}
                  className={`${CATEGORY_BAR_COLORS[cat]} transition-all`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {categories.map(([cat, count]) =>
              count > 0 ? (
                <span key={cat} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={`inline-block h-2 w-2 rounded-full ${CATEGORY_BAR_COLORS[cat]}`} />
                  {PROJECT_CATEGORY_LABELS[cat]} ({count})
                </span>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Recent projects list */}
      <h3 className="mb-3 text-sm font-medium text-muted">Nedávné projekty</h3>
      {recent_projects.length === 0 ? (
        <p className="text-sm text-muted">Zatím žádné projekty</p>
      ) : (
        <ul className="space-y-3">
          {recent_projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {project.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <CategoryBadge category={project.category} />
                  {project.task_count != null && (
                    <span className="text-xs text-muted">
                      {project.done_count ?? 0}/{project.task_count} úkolů
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={project.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
