"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Project,
  ProjectCategory,
  ProjectStatus,
  Priority,
  PROJECT_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/types";
import { createProject, updateProject } from "@/lib/api";

interface ProjectFormProps {
  questionnaire_id: string;
  project?: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const categories = Object.entries(PROJECT_CATEGORY_LABELS) as [ProjectCategory, string][];
const statuses = Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][];
const priorities = Object.entries(PRIORITY_LABELS) as [Priority, string][];

export default function ProjectForm({
  questionnaire_id,
  project,
  onSave,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState<ProjectCategory>(project?.category ?? "operations");
  const [priority, setPriority] = useState<Priority>(project?.priority ?? "medium");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "planned");
  const [dueDate, setDueDate] = useState(project?.due_date ?? "");
  const [saving, setSaving] = useState(false);

  const isEdit = !!project;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        status,
        due_date: dueDate || null,
        questionnaire_id,
      };

      const saved = isEdit
        ? await updateProject(project.id, data)
        : await createProject(data);

      onSave(saved);
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Upravit projekt" : "Nový projekt"}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Název *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Název projektu"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Popis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Popis projektu"
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Kategorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
                {categories.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Priorita
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
                {priorities.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Due date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Stav
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
                {statuses.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Termín
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Ukládám..." : isEdit ? "Uložit" : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
