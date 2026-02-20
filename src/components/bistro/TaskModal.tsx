"use client";

import { useState, useEffect, useRef } from "react";
import type { BistroTask, BistroPhase, BistroTaskType, BistroPriority, BistroTaskStatus } from "@/types";

const ASSIGNEES = [
  "Tomáš Knopp",
  "Vedoucí bistra",
  "Kuchař",
  "Brigádník",
  "IT",
  "Grafik / Marketing",
  "Dodavatelé",
  "HACCP konzultant",
  "Servisní technik",
  "KHS Plzeň",
  "Pivovar",
];

const PRIORITIES: { value: BistroPriority; label: string; dot: string }[] = [
  { value: "high", label: "Vysoká", dot: "bg-red-500" },
  { value: "medium", label: "Střední", dot: "bg-amber-400" },
  { value: "low", label: "Nízká", dot: "bg-gray-400" },
];

const TYPES: { value: BistroTaskType; label: string; icon: string; desc: string }[] = [
  { value: "task", label: "Úkol", icon: "○", desc: "Konkrétní pracovní položka" },
  { value: "milestone", label: "Milník", icon: "◆", desc: "Klíčová událost nebo přechod" },
  { value: "goal", label: "Cíl", icon: "⚑", desc: "Měřitelný výsledek fáze" },
];

const STATUSES: { value: BistroTaskStatus; label: string }[] = [
  { value: "todo", label: "K udělání" },
  { value: "in_progress", label: "Probíhá" },
  { value: "done", label: "Hotovo" },
];

interface Props {
  task: BistroTask | null;
  phases: BistroPhase[];
  defaultPhaseId?: string;
  defaultType?: BistroTaskType;
  onSave: (data: Partial<BistroTask> & { phase_id: string; title: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, phases, defaultPhaseId, defaultType, onSave, onDelete, onClose }: Props) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [type, setType] = useState<BistroTaskType>(task?.type ?? defaultType ?? "task");
  const [status, setStatus] = useState<BistroTaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<BistroPriority>(task?.priority ?? "medium");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? "");
  const [phaseId, setPhaseId] = useState(task?.phase_id ?? defaultPhaseId ?? phases[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...(isEdit ? { id: task!.id } : {}),
        phase_id: phaseId,
        title: title.trim(),
        description: description.trim() || null,
        type,
        status,
        priority,
        assignee: assignee.trim() || null,
        due_date: dueDate || null,
      } as Partial<BistroTask> & { phase_id: string; title: string });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task || !onDelete) return;
    if (!confirm(`Smazat "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TYPES.find(t => t.value === type)?.icon}</span>
            <h2 className="font-semibold text-foreground">
              {isEdit ? "Upravit" : "Nový"} {TYPES.find(t => t.value === type)?.label.toLowerCase()}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Typ</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg border text-xs transition-all ${
                    type === t.value
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-border text-muted hover:border-primary/40"
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Název *</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={type === "milestone" ? "Název milníku..." : type === "goal" ? "Název cíle..." : "Co je potřeba udělat?"}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Popis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Volitelný popis..."
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Row: priority + status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Priorita</label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-all ${
                      priority === p.value
                        ? "border-primary bg-blue-50 text-primary font-medium"
                        : "border-border text-muted hover:border-primary/40"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Stav</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BistroTaskStatus)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: assignee + due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Odpovědná osoba</label>
              <input
                type="text"
                list="assignees-list"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Jméno..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
              <datalist id="assignees-list">
                {ASSIGNEES.map((a) => <option key={a} value={a} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Termín</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Phase selector */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Fáze</label>
            <select
              value={phaseId}
              onChange={(e) => setPhaseId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  Fáze {p.phase_number}: {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm text-danger hover:text-danger/80 transition-colors"
                >
                  {deleting ? "Mazání..." : "Smazat"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Ukládám..." : isEdit ? "Uložit změny" : "Vytvořit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
