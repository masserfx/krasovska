"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Project,
  Task,
  TaskStatus,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
} from "@/types";
import {
  fetchProject,
  fetchTasks,
  updateProject,
  deleteProject,
  updateTask,
  deleteTask,
} from "@/lib/api";
import AppHeader from "@/components/AppHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import ProjectForm from "@/components/ProjectForm";

const statuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, taskList] = await Promise.all([
        fetchProject(id),
        fetchTasks(id),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleStatusChange(newStatus: ProjectStatus) {
    if (!project) return;
    try {
      const updated = await updateProject(project.id, { status: newStatus });
      setProject(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm("Opravdu chcete smazat tento projekt? Tato akce je nevratná.")) return;

    setDeleting(true);
    try {
      await deleteProject(project.id);
      const qid = project.questionnaire_id;
      router.push(qid ? `/projects?id=${qid}` : "/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
      setDeleting(false);
    }
  }

  async function handleTaskStatusChange(taskId: string, status: TaskStatus) {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  async function handleTaskDelete(taskId: string) {
    if (!confirm("Smazat tento úkol?")) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  function handleTaskSaved(task: Task) {
    setTasks((prev) => [...prev, task]);
    setShowTaskForm(false);
  }

  function handleProjectSaved(updated: Project) {
    setProject(updated);
    setShowEditForm(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Projekt nenalezen</p>
      </div>
    );
  }

  const qid = project.questionnaire_id;
  const backUrl = qid ? `/projects?id=${qid}` : "/projects";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="projects" />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Back link */}
        <button
          onClick={() => router.push(backUrl)}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na projekty
        </button>

        {/* Project info card */}
        <div className="mb-6 rounded-xl border border-border bg-white p-6 shadow-sm">
          {/* Header row */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={project.category} />
                <PriorityBadge priority={project.priority} />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {project.title}
              </h2>
              {project.description && (
                <p className="mt-1 text-sm text-muted">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="rounded-lg border border-border bg-white p-2 text-muted hover:bg-background hover:text-foreground"
                title="Upravit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-border bg-white p-2 text-muted hover:bg-danger/10 hover:text-danger"
                title="Smazat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status + due date row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Stav:</span>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
                {statuses.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {project.due_date && (
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays className="h-4 w-4" />
                Termín: {new Date(project.due_date).toLocaleDateString("cs-CZ")}
              </div>
            )}
          </div>
        </div>

        {/* Tasks section */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Úkoly ({tasks.length})
          </h3>
          {!showTaskForm && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Přidat úkol
            </button>
          )}
        </div>

        <TaskList
          tasks={tasks}
          onStatusChange={handleTaskStatusChange}
          onDelete={handleTaskDelete}
        />

        {/* Task form */}
        {showTaskForm && (
          <div className="mt-4">
            <TaskForm
              projectId={project.id}
              onSave={handleTaskSaved}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        )}
      </main>

      {/* Edit project modal */}
      {showEditForm && (
        <ProjectForm
          questionnaire_id={qid ?? ""}
          project={project}
          onSave={handleProjectSaved}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
