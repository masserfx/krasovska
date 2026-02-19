"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import PhaseSwimLane from "./PhaseSwimLane";
import TaskModal from "./TaskModal";
import type { BistroTask, BistroPhase, BistroTaskType } from "@/types";

// ─── Toast ──────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "warning" | "info";
}

let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium cursor-pointer transition-all
            ${t.type === "success" ? "bg-green-600 text-white" :
              t.type === "warning" ? "bg-amber-500 text-white" :
              "bg-foreground text-white"
            }`}
        >
          <span>{t.type === "success" ? "✓" : t.type === "warning" ? "⚠" : "ℹ"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Notification Bell ───────────────────────────────────────────────────────

function NotificationBell({ tasks }: { tasks: BistroTask[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const overdue = tasks.filter(
    (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date()
  );
  const dueToday = tasks.filter((t) => {
    if (!t.due_date || t.status === "done") return false;
    const today = new Date();
    const due = new Date(t.due_date);
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  });

  const total = overdue.length + dueToday.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors
          ${open ? "bg-primary text-white" : "bg-background border border-border text-foreground hover:border-primary"}
        `}
      >
        🔔
        {total > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Upozornění</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {total === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">
                Vše v pořádku ✓
              </div>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div className="px-3 py-2 bg-red-50 border-b border-border">
                    <p className="text-xs font-semibold text-red-600 mb-1">Po termínu ({overdue.length})</p>
                    {overdue.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 py-1">
                        <span className="text-red-500 text-xs">⚠</span>
                        <span className="text-xs text-foreground flex-1 truncate">{t.title}</span>
                        <span className="text-xs text-red-500">
                          {new Date(t.due_date!).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {dueToday.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-amber-600 mb-1">Dnes ({dueToday.length})</p>
                    {dueToday.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 py-1">
                        <span className="text-amber-500 text-xs">◷</span>
                        <span className="text-xs text-foreground flex-1 truncate">{t.title}</span>
                        <span className="text-xs text-muted">{t.assignee ?? "–"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main board ──────────────────────────────────────────────────────────────

export default function KanbanBoard({ phaseId }: { phaseId?: string }) {
  const [tasks, setTasks] = useState<BistroTask[]>([]);
  const [phases, setPhases] = useState<BistroPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<BistroTask | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal state
  const [modalTask, setModalTask] = useState<BistroTask | null | undefined>(undefined); // undefined = closed
  const [modalDefaults, setModalDefaults] = useState<{ phaseId?: string; type?: BistroTaskType }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        fetch("/api/bistro/phases"),
        fetch("/api/bistro/tasks"),
      ]);
      if (!pRes.ok || !tRes.ok) throw new Error("Chyba při načítání dat");
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      setPhases(pData);
      setTasks(tData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Neznámá chyba");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  // ── Task CRUD ─────────────────────────────────────────────────────────────
  async function updateTaskStatus(taskId: string, newStatus: BistroTask["status"]) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      const res = await fetch(`/api/bistro/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Chyba při ukládání");
      const updated: BistroTask = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

      const statusLabel = newStatus === "done" ? "Hotovo" : newStatus === "in_progress" ? "Probíhá" : "K udělání";
      addToast(`Přesunuto do: ${statusLabel}`, newStatus === "done" ? "success" : "info");
    } catch {
      fetchAll();
      addToast("Nepodařilo se uložit změnu", "warning");
    }
  }

  async function handleSaveTask(data: Partial<BistroTask> & { phase_id: string; title: string }) {
    const isEdit = "id" in data && !!data.id;
    if (isEdit) {
      // Optimistic
      setTasks((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
      await fetch(`/api/bistro/tasks/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      addToast("Úkol uložen", "success");
    } else {
      const res = await fetch("/api/bistro/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newTask: BistroTask = await res.json();
        setTasks((prev) => [...prev, newTask]);
        addToast("Úkol vytvořen", "success");
      }
    }
    await fetchAll();
  }

  async function handleDeleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/bistro/tasks/${id}`, { method: "DELETE" });
    addToast("Úkol smazán", "info");
  }

  // ── Status toggle (checkbox click) ───────────────────────────────────────
  function handleStatusToggle(task: BistroTask) {
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTaskStatus(task.id, newStatus);
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const overId = over.id as string; // format: "phaseId:status" or task id

    // Parse column id (format: "<phaseId>:<status>")
    const colMatch = overId.match(/^(.+):(todo|in_progress|done)$/);
    if (colMatch) {
      const newStatus = colMatch[2] as BistroTask["status"];
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        await updateTaskStatus(taskId, newStatus);
      }
      return;
    }

    // Dropped on another task → use that task's column
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetTask.status) {
        await updateTaskStatus(taskId, targetTask.status);
      }
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openNewTask(pId: string, type?: BistroTaskType) {
    setModalDefaults({ phaseId: pId, type });
    setModalTask(null); // null = new task
  }

  function openEditTask(task: BistroTask) {
    setModalTask(task);
    setModalDefaults({});
  }

  function closeModal() {
    setModalTask(undefined);
  }

  // ── Filter by phase if prop given ─────────────────────────────────────────
  const visiblePhases = phaseId
    ? phases.filter((p) => p.id === phaseId)
    : phases;

  // ── Stats bar ─────────────────────────────────────────────────────────────
  const totalTasks = tasks.filter((t) => t.type === "task").length;
  const doneTasks = tasks.filter((t) => t.type === "task" && t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.type === "task" && t.status === "in_progress").length;
  const overdueCount = tasks.filter(
    (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger bg-red-50 p-4 text-center text-sm text-danger">
        {error}
        <button onClick={fetchAll} className="ml-3 underline">Zkusit znovu</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board header */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-4 flex-1">
          <StatPill label="Celkem" value={totalTasks} color="text-foreground" />
          <StatPill label="Probíhá" value={inProgressTasks} color="text-blue-600" />
          <StatPill label="Hotovo" value={doneTasks} color="text-green-600" />
          {overdueCount > 0 && (
            <StatPill label="Po termínu" value={overdueCount} color="text-red-500" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell tasks={tasks} />
          <button
            onClick={() => openNewTask(phases[0]?.id ?? "", "task")}
            className="text-sm font-medium px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            + Nový úkol
          </button>
        </div>
      </div>

      {/* Swimlanes */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          {visiblePhases.map((phase) => (
            <PhaseSwimLane
              key={phase.id}
              phase={phase}
              tasks={tasks.filter((t) => t.phase_id === phase.id)}
              onTaskClick={openEditTask}
              onAddTask={openNewTask}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task modal */}
      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          phases={phases}
          defaultPhaseId={modalDefaults.phaseId}
          defaultType={modalDefaults.type}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={closeModal}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
