"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BistroTask } from "@/types";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

const TYPE_ICON: Record<string, string> = {
  task: "○",
  milestone: "◆",
  goal: "⚑",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-amber-500", "bg-rose-500", "bg-teal-500",
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function isOverdue(task: BistroTask): boolean {
  if (!task.due_date || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.due_date) < today;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

interface Props {
  task: BistroTask;
  onClick: (task: BistroTask) => void;
  onStatusToggle?: (task: BistroTask) => void;
  isDragOverlay?: boolean;
}

export default function TaskCard({ task, onClick, onStatusToggle, isDragOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isDragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task);
  const done = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`group relative rounded-lg border bg-white p-3 transition-all select-none
        ${isDragOverlay
          ? "shadow-xl border-primary rotate-1 scale-105"
          : "shadow-sm hover:shadow-md hover:border-primary/30 cursor-grab active:cursor-grabbing"
        }
        ${done ? "opacity-60" : ""}
        ${overdue ? "border-l-2 border-l-red-400" : "border-border"}
      `}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-1.5">
        {/* Type icon */}
        <span className={`text-xs flex-shrink-0 ${
          task.type === "milestone" ? "text-amber-500" :
          task.type === "goal" ? "text-green-600" : "text-muted"
        }`}>
          {TYPE_ICON[task.type] ?? "○"}
        </span>

        {/* Priority dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-gray-300"}`} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Done toggle */}
        {onStatusToggle && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onStatusToggle(task); }}
            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
              ${done
                ? "bg-green-500 border-green-500 text-white"
                : "border-border hover:border-green-500"
              }`}
          >
            {done && <span className="text-[9px] leading-none">✓</span>}
          </button>
        )}
      </div>

      {/* Title – click to edit */}
      <h4
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onClick(task); }}
        className={`text-sm font-medium cursor-pointer hover:text-primary transition-colors
          ${done ? "line-through text-muted" : "text-foreground"}
        `}
      >
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="mt-1 text-xs text-muted line-clamp-2">{task.description}</p>
      )}

      {/* Footer: due date + assignee */}
      <div className="mt-2 flex items-center gap-2">
        {task.due_date && (
          <span className={`text-xs flex items-center gap-0.5 ${overdue ? "text-red-500 font-medium" : "text-muted"}`}>
            {overdue && <span>⚠</span>}
            {formatDate(task.due_date)}
          </span>
        )}

        <div className="flex-1" />

        {task.assignee && (
          <span
            title={task.assignee}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${getAvatarColor(task.assignee)}`}
          >
            {getInitials(task.assignee)}
          </span>
        )}
      </div>
    </div>
  );
}
