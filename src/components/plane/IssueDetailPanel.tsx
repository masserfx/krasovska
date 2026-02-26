"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Send,
  Loader2,
  Calendar,
  Flag,
  MessageSquare,
} from "lucide-react";

interface StateOption {
  id: string;
  name: string;
  group: string;
  color: string;
}

interface Comment {
  id: string;
  comment_html: string;
  created_at: string;
  actor_detail?: { display_name?: string; first_name?: string; email?: string };
}

interface IssueDetailPanelProps {
  projectId: string;
  issueId: string;
  prefix: string;
  sequenceId: number;
  states: StateOption[];
  onClose: () => void;
  onUpdated: () => void;
}

const PRIORITIES = [
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f59e0b" },
  { value: "medium", label: "Medium", color: "#3b82f6" },
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "none", label: "Bez priority", color: "#9ca3af" },
];

export default function IssueDetailPanel({
  projectId,
  issueId,
  prefix,
  sequenceId,
  states,
  onClose,
  onUpdated,
}: IssueDetailPanelProps) {
  const [issue, setIssue] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const fetchIssue = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/plane/issues?project_id=${projectId}&issue_id=${issueId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIssue(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch issue:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, issueId]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  async function updateField(field: string, value: string | null) {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/plane/issues?project_id=${projectId}&issue_id=${issueId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setIssue((prev) => ({ ...prev, ...updated }));
      onUpdated();
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setSaving(false);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const res = await fetch(
        `/api/plane/issues?project_id=${projectId}&issue_id=${issueId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_html: `<p>${newComment.replace(/\n/g, "<br/>")}</p>`,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSendingComment(false);
    }
  }

  if (loading) {
    return (
      <Panel onClose={onClose}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted" />
        </div>
      </Panel>
    );
  }

  if (!issue) {
    return (
      <Panel onClose={onClose}>
        <div className="p-6 text-center text-muted">Nepodařilo se načíst úkol</div>
      </Panel>
    );
  }

  const currentState = states.find((s) => s.id === issue.state);
  const currentPriority = PRIORITIES.find((p) => p.value === issue.priority) || PRIORITIES[4];

  return (
    <Panel onClose={onClose}>
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">
            {prefix}-{sequenceId}
          </span>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
            <button onClick={onClose} className="text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h3 className="mt-1 text-lg font-semibold text-foreground">
          {issue.name as string}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <FieldRow icon={<CheckCircle2 className="h-4 w-4" />} label="Stav">
          <select
            value={(issue.state as string) || ""}
            onChange={(e) => updateField("state", e.target.value)}
            className="rounded-md border border-border bg-white px-2 py-1 text-sm"
          >
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow icon={<Flag className="h-4 w-4" />} label="Priorita">
          <select
            value={(issue.priority as string) || "none"}
            onChange={(e) => updateField("priority", e.target.value)}
            className="rounded-md border border-border bg-white px-2 py-1 text-sm"
            style={{ color: currentPriority.color }}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow icon={<Calendar className="h-4 w-4" />} label="Začátek">
          <input
            type="date"
            value={(issue.start_date as string) || ""}
            onChange={(e) => updateField("start_date", e.target.value || null)}
            className="rounded-md border border-border bg-white px-2 py-1 text-sm"
          />
        </FieldRow>

        <FieldRow icon={<AlertCircle className="h-4 w-4" />} label="Termín">
          <input
            type="date"
            value={(issue.target_date as string) || ""}
            onChange={(e) => updateField("target_date", e.target.value || null)}
            className="rounded-md border border-border bg-white px-2 py-1 text-sm"
          />
        </FieldRow>

        {typeof issue.description_html === "string" && issue.description_html && (
          <div>
            <div className="mb-1 text-xs font-medium text-muted uppercase">Popis</div>
            <div
              className="prose prose-sm max-w-none rounded-lg bg-gray-50 p-3 text-sm"
              dangerouslySetInnerHTML={{ __html: issue.description_html }}
            />
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted uppercase">
            <MessageSquare className="h-3.5 w-3.5" />
            Komentáře ({comments.length})
          </div>

          {comments.length > 0 && (
            <div className="mb-3 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>
                      {c.actor_detail?.display_name ||
                        c.actor_detail?.first_name ||
                        c.actor_detail?.email ||
                        "—"}
                    </span>
                    <span>{new Date(c.created_at).toLocaleString("cs-CZ")}</span>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: c.comment_html }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Napsat komentář..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  addComment();
                }
              }}
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim() || sendingComment}
              className="self-end rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-1 text-xs text-muted">Cmd+Enter pro odeslání</div>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-xl animate-in slide-in-from-right duration-200">
        {children}
      </div>
    </>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
