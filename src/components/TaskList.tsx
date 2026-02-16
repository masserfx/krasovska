"use client";

import { Task, TaskStatus } from "@/types";
import { ListChecks } from "lucide-react";
import TaskItem from "@/components/TaskItem";
import EmptyState from "@/components/EmptyState";

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Žádné úkoly"
        description="Tento projekt zatím nemá žádné úkoly. Přidejte první úkol pomocí formuláře níže."
      />
    );
  }

  // Sort: todo first, then in_progress, then done
  const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, done: 2 };
  const sorted = [...tasks].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status] || a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-2">
      {sorted.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={(status) => onStatusChange(task.id, status)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </div>
  );
}
