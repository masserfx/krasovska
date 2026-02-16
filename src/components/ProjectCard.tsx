"use client";

import { Project, PROJECT_CATEGORY_LABELS, PROJECT_STATUS_LABELS, PRIORITY_LABELS } from "@/types";
import { CalendarDays } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const taskCount = project.task_count ?? 0;
  const doneCount = project.done_count ?? 0;
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border bg-white p-6 shadow-sm text-left transition-shadow hover:shadow-md w-full"
    >
      {/* Header badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={project.category} />
        <StatusBadge status={project.status} type="project" />
        <PriorityBadge priority={project.priority} />
      </div>

      {/* Title */}
      <h3 className="mb-1 text-base font-semibold text-foreground">
        {project.title}
      </h3>

      {/* Description */}
      {project.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted">
          {project.description}
        </p>
      )}

      {/* Progress bar */}
      {taskCount > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>Úkoly</span>
            <span>
              {doneCount}/{taskCount} ({progress}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background">
            <div
              className="h-1.5 rounded-full bg-success transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Due date */}
      {project.due_date && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>
            {new Date(project.due_date).toLocaleDateString("cs-CZ")}
          </span>
        </div>
      )}
    </button>
  );
}
