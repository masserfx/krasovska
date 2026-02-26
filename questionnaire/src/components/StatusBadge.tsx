import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  todo: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

interface StatusBadgeProps {
  status: string;
  type?: "project" | "task";
}

export default function StatusBadge({ status, type = "project" }: StatusBadgeProps) {
  const labels = type === "task" ? TASK_STATUS_LABELS : PROJECT_STATUS_LABELS;
  const label = (labels as Record<string, string>)[status] ?? status;
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
