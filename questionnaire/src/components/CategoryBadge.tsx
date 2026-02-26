import { ProjectCategory, PROJECT_CATEGORY_LABELS } from "@/types";

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  strategic: "bg-purple-100 text-purple-700",
  marketing: "bg-pink-100 text-pink-700",
  operations: "bg-cyan-100 text-cyan-700",
  development: "bg-indigo-100 text-indigo-700",
  infrastructure: "bg-amber-100 text-amber-700",
};

export default function CategoryBadge({ category }: { category: ProjectCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category]}`}>
      {PROJECT_CATEGORY_LABELS[category]}
    </span>
  );
}
