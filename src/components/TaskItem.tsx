"use client";

import { Task, TaskStatus, PRIORITY_LABELS } from "@/types";
import { X, CalendarDays, User } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";

interface TaskItemProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const statusIcons: Record<TaskStatus, string> = {
  todo: "",
  in_progress: "~",
  done: "v",
};

export default function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  function handleToggle() {
    onStatusChange(statusCycle[task.status]);
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3 transition-colors ${
        isDone ? "opacity-60" : ""
      }`}
    >
      {/* Status checkbox */}
      <button
        onClick={handleToggle}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 text-xs font-bold transition-colors ${
          isDone
            ? "border-success bg-success text-white"
            : isInProgress
            ? "border-primary-light bg-primary-light/10 text-primary"
            : "border-border bg-white text-transparent hover:border-muted"
        }`}
        title={isDone ? "Hotovo" : isInProgress ? "Probíhající" : "K řešení"}
      >
        {isDone ? "\u2713" : isInProgress ? "\u25CB" : ""}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            isDone ? "text-muted line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
            {task.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.assignee && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <User className="h-3 w-3" />
              {task.assignee}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <CalendarDays className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString("cs-CZ")}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 rounded p-1 text-muted hover:bg-danger/10 hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
