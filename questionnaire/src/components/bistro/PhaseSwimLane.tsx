"use client";

import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import type { BistroTask, BistroPhase, BistroTaskType } from "@/types";

const PHASE_COLORS: Record<number, { border: string; badge: string; bar: string; light: string }> = {
  0: { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500", light: "bg-blue-50" },
  1: { border: "border-l-green-500", badge: "bg-green-100 text-green-700", bar: "bg-green-500", light: "bg-green-50" },
  2: { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500", light: "bg-amber-50" },
  3: { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700", bar: "bg-purple-500", light: "bg-purple-50" },
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Plánováno",
  active: "Aktivní",
  completed: "Dokončeno",
};

const STATUS_DOT: Record<string, string> = {
  planned: "bg-gray-400",
  active: "bg-blue-500 animate-pulse",
  completed: "bg-green-500",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

function DroppableColumn({
  id,
  label,
  tasks,
  onTaskClick,
  onStatusToggle,
  onAddTask,
  phaseColor,
}: {
  id: string;
  label: string;
  tasks: BistroTask[];
  onTaskClick: (t: BistroTask) => void;
  onStatusToggle: (t: BistroTask) => void;
  onAddTask: () => void;
  phaseColor: typeof PHASE_COLORS[0];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border min-w-0 transition-colors
        ${isOver ? `border-primary ${phaseColor.light}` : "border-border bg-background"}
      `}
    >
      {/* Column header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-border">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
          tasks.length > 0 ? phaseColor.badge : "bg-gray-100 text-muted"
        }`}>
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[80px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onStatusToggle={onStatusToggle}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add button */}
      <button
        onClick={onAddTask}
        className="mx-2 mb-2 py-1.5 text-xs text-muted hover:text-primary hover:bg-white rounded border border-dashed border-border hover:border-primary/40 transition-all"
      >
        + Přidat
      </button>
    </div>
  );
}

function SpecialItemRow({ task, onEdit }: { task: BistroTask; onEdit: (t: BistroTask) => void }) {
  const isOverdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
  const done = task.status === "done";

  const typeStyle = task.type === "milestone"
    ? "text-amber-600 font-bold"
    : "text-green-700";

  return (
    <div
      onClick={() => onEdit(task)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white hover:shadow-sm border border-transparent hover:border-border ${
        done ? "opacity-50" : ""
      }`}
    >
      <span className={`text-sm ${typeStyle}`}>
        {task.type === "milestone" ? "◆" : "⚑"}
      </span>
      <span className={`text-sm flex-1 ${done ? "line-through text-muted" : "text-foreground"}`}>
        {task.title}
      </span>
      {task.assignee && (
        <span className="text-xs text-muted hidden sm:block">{task.assignee}</span>
      )}
      {task.due_date && (
        <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted"}`}>
          {isOverdue && "⚠ "}
          {formatDate(task.due_date)}
        </span>
      )}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
        task.status === "done" ? "bg-green-100 text-green-700" :
        task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
        "bg-gray-100 text-muted"
      }`}>
        {task.status === "done" ? "✓ Hotovo" :
         task.status === "in_progress" ? "● Probíhá" : "○ K udělání"}
      </span>
    </div>
  );
}

interface Props {
  phase: BistroPhase;
  tasks: BistroTask[];
  onTaskClick: (task: BistroTask) => void;
  onAddTask: (phaseId: string, type?: BistroTaskType) => void;
  onStatusToggle: (task: BistroTask) => void;
}

export default function PhaseSwimLane({ phase, tasks, onTaskClick, onAddTask, onStatusToggle }: Props) {
  const [collapsed, setCollapsed] = useState(phase.status === "planned" && phase.phase_number > 0);

  const color = PHASE_COLORS[phase.phase_number % 4] ?? PHASE_COLORS[0];

  const milestones = tasks.filter((t) => t.type === "milestone");
  const goals = tasks.filter((t) => t.type === "goal");
  const regularTasks = tasks.filter((t) => t.type === "task");

  const doneTasks = regularTasks.filter((t) => t.status === "done").length;
  const totalTasks = regularTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const overdueCount = tasks.filter((t) =>
    t.due_date && t.status !== "done" && new Date(t.due_date) < new Date()
  ).length;

  const columns = [
    { id: `${phase.id}:todo`, label: "K udělání", tasks: regularTasks.filter((t) => t.status === "todo") },
    { id: `${phase.id}:in_progress`, label: "Probíhá", tasks: regularTasks.filter((t) => t.status === "in_progress") },
    { id: `${phase.id}:done`, label: "Hotovo", tasks: regularTasks.filter((t) => t.status === "done") },
  ];

  return (
    <div className={`rounded-xl border-l-4 border border-border bg-white shadow-sm ${color.border}`}>
      {/* Phase header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background/50 rounded-t-xl transition-colors"
      >
        {/* Collapse arrow */}
        <span className={`text-muted text-xs transition-transform ${collapsed ? "" : "rotate-90"}`}>▶</span>

        {/* Phase title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-semibold text-foreground text-sm">
            Fáze {phase.phase_number}: {phase.title}
          </span>
          {/* Status badge */}
          <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[phase.status] ?? "bg-gray-400"}`} />
            {STATUS_LABELS[phase.status] ?? phase.status}
          </span>
          {/* Overdue warning */}
          {overdueCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
              ⚠ {overdueCount} po termínu
            </span>
          )}
        </div>

        {/* Date range */}
        {phase.start_date && phase.end_date && (
          <span className="hidden md:block text-xs text-muted flex-shrink-0">
            {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
          </span>
        )}

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progressPct >= 80 ? "bg-green-500" :
                progressPct >= 50 ? color.bar :
                progressPct > 0 ? "bg-amber-400" : "bg-gray-200"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted w-16 text-right">
            {doneTasks}/{totalTasks} ({progressPct}%)
          </span>
        </div>

        {/* Add task */}
        <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onAddTask(phase.id, "task")}
            className={`hidden sm:block text-xs px-2.5 py-1 rounded-lg ${color.badge} font-medium hover:opacity-80 transition-opacity`}
          >
            + Úkol
          </button>
        </div>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Goals */}
          {(goals.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">⚑ Cíle</span>
                <button
                  onClick={() => onAddTask(phase.id, "goal")}
                  className="text-xs text-muted hover:text-primary transition-colors"
                >
                  + přidat
                </button>
              </div>
              <div className={`rounded-lg p-1 space-y-0.5 ${color.light}`}>
                {goals.map((t) => (
                  <SpecialItemRow key={t.id} task={t} onEdit={onTaskClick} />
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {(milestones.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">◆ Milníky</span>
                <button
                  onClick={() => onAddTask(phase.id, "milestone")}
                  className="text-xs text-muted hover:text-primary transition-colors"
                >
                  + přidat
                </button>
              </div>
              <div className={`rounded-lg p-1 space-y-0.5 ${color.light}`}>
                {milestones.map((t) => (
                  <SpecialItemRow key={t.id} task={t} onEdit={onTaskClick} />
                ))}
              </div>
            </div>
          )}

          {/* Add goal/milestone buttons when empty */}
          {goals.length === 0 && milestones.length === 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => onAddTask(phase.id, "goal")}
                className="text-xs text-muted hover:text-green-600 transition-colors py-1 px-2 rounded border border-dashed border-border hover:border-green-400"
              >
                ⚑ Přidat cíl
              </button>
              <button
                onClick={() => onAddTask(phase.id, "milestone")}
                className="text-xs text-muted hover:text-amber-600 transition-colors py-1 px-2 rounded border border-dashed border-border hover:border-amber-400"
              >
                ◆ Přidat milník
              </button>
            </div>
          )}
          {(goals.length > 0 || milestones.length > 0) && (
            <div className="flex gap-2">
              {goals.length > 0 && milestones.length === 0 && (
                <button
                  onClick={() => onAddTask(phase.id, "milestone")}
                  className="text-xs text-muted hover:text-amber-600 transition-colors py-1 px-2 rounded border border-dashed border-border hover:border-amber-400"
                >
                  ◆ Přidat milník
                </button>
              )}
              {milestones.length > 0 && goals.length === 0 && (
                <button
                  onClick={() => onAddTask(phase.id, "goal")}
                  className="text-xs text-muted hover:text-green-600 transition-colors py-1 px-2 rounded border border-dashed border-border hover:border-green-400"
                >
                  ⚑ Přidat cíl
                </button>
              )}
            </div>
          )}

          {/* Kanban columns */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Úkoly</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {columns.map((col) => (
                <DroppableColumn
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  tasks={col.tasks}
                  onTaskClick={onTaskClick}
                  onStatusToggle={onStatusToggle}
                  onAddTask={() => onAddTask(phase.id, "task")}
                  phaseColor={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
