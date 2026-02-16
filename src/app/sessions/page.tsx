"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireMetadata } from "@/types";
import { fetchQuestionnaires, createQuestionnaire, deleteQuestionnaire } from "@/lib/api";
import { Plus, Trash2, FileText, Loader2, AlertCircle } from "lucide-react";

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<QuestionnaireMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchQuestionnaires();
      setSessions(data);
    } catch {
      setError("Nepodařilo se načíst dotazníky. Zkontrolujte připojení k databázi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const date = new Date().toLocaleDateString("cs-CZ");
      const { id } = await createQuestionnaire(`Schůzka ${date}`);
      router.push(`/?id=${id}`);
    } catch {
      setError("Nepodařilo se vytvořit dotazník.");
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento dotazník? Tato akce je nevratná.")) return;
    setDeletingId(id);
    try {
      await deleteQuestionnaire(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Nepodařilo se smazat dotazník.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Hala Krašovská
            </h1>
            <p className="text-xs text-muted">Správa dotazníků</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Dotazníky</h2>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Nový dotazník
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted/50" />
            <p className="text-sm font-medium text-foreground">
              Zatím žádné dotazníky
            </p>
            <p className="mt-1 text-xs text-muted">
              Vytvořte nový dotazník pro další schůzku
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm transition-colors hover:bg-background/50"
              >
                <button
                  onClick={() => router.push(`/?id=${session.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <FileText className="h-5 w-5 shrink-0 text-primary-light" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted">
                      Vytvořeno: {formatDate(session.created_at)}
                      {session.updated_at !== session.created_at && (
                        <> &middot; Upraveno: {formatDate(session.updated_at)}</>
                      )}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deletingId === session.id}
                  className="ml-3 shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  title="Smazat dotazník"
                >
                  {deletingId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
