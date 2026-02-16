"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Task, Priority, PRIORITY_LABELS } from "@/types";
import { createTask } from "@/lib/api";

interface TaskFormProps {
  projectId: string;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const priorities = Object.entries(PRIORITY_LABELS) as [Priority, string][];

export default function TaskForm({ projectId, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const task = await createTask(projectId, {
        title: title.trim(),
        description: description.trim() || null,
        status: "todo",
        priority,
        assignee: assignee.trim() || null,
        due_date: dueDate || null,
        sort_order: 0,
      });
      onSave(task);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignee("");
      setDueDate("");
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-white p-4 shadow-sm"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Přidat úkol
      </h3>

      <div className="space-y-3">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Název úkolu *"
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Popis (volitelné)"
          rows={2}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        />

        {/* Priority + Assignee + Due date row */}
        <div className="grid grid-cols-3 gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
          >
            {priorities.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Přiřazeno"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Ukládám..." : "Přidat"}
          </button>
        </div>
      </div>
    </form>
  );
}
