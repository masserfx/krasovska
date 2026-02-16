"use client";

import {
  ProjectCategory,
  ProjectStatus,
  PROJECT_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/types";

interface ProjectFilterProps {
  category: ProjectCategory | null;
  status: ProjectStatus | null;
  onCategoryChange: (cat: ProjectCategory | null) => void;
  onStatusChange: (st: ProjectStatus | null) => void;
}

const categories = Object.entries(PROJECT_CATEGORY_LABELS) as [ProjectCategory, string][];
const statuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][];

export default function ProjectFilter({
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: ProjectFilterProps) {
  return (
    <div className="space-y-3">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            category === null
              ? "bg-primary text-white"
              : "bg-white text-muted border border-border hover:text-foreground"
          }`}
        >
          Vše
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === key
                ? "bg-primary text-white"
                : "bg-white text-muted border border-border hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            status === null
              ? "bg-primary text-white"
              : "bg-white text-muted border border-border hover:text-foreground"
          }`}
        >
          Vše
        </button>
        {statuses.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === key
                ? "bg-primary text-white"
                : "bg-white text-muted border border-border hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
