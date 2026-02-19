"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { Project, ProjectCategory, ProjectStatus } from "@/types";
import { fetchProjects } from "@/lib/api";
import { useQuestionnaireId } from "@/hooks/useQuestionnaireId";
import AppHeader from "@/components/AppHeader";
import ProjectFilter from "@/components/ProjectFilter";
import ProjectCard from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import EmptyState from "@/components/EmptyState";

function ProjectsContent() {
  const router = useRouter();
  const questionnaireId = useQuestionnaireId();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!questionnaireId) return;
    setLoading(true);
    try {
      const data = await fetchProjects({
        questionnaire_id: questionnaireId,
        category: category ?? undefined,
        status: status ?? undefined,
      });
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, category, status]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleProjectSaved() {
    setShowForm(false);
    loadProjects();
  }

  function handleProjectClick(project: Project) {
    const params = questionnaireId ? `?id=${questionnaireId}` : "";
    router.push(`/projects/${project.id}${params}`);
  }

  if (!questionnaireId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted/40" />
          <p className="mb-2 text-sm font-medium text-foreground">Žádný dotazník není vybrán</p>
          <Link href="/sessions" className="text-sm text-primary hover:underline">
            Vybrat dotazník
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Projekty</h2>
          <p className="text-sm text-muted">
            Správa projektů a jejich úkolů
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Nový projekt
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProjectFilter
          category={category}
          status={status}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
        />
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Žádné projekty"
          description="Zatím nemáte žádné projekty. Vytvořte první projekt pomocí tlačítka výše."
          action={{
            label: "Nový projekt",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      )}

      {/* Project form modal */}
      {showForm && (
        <ProjectForm
          questionnaire_id={questionnaireId}
          onSave={handleProjectSaved}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="projects" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <ProjectsContent />
        </Suspense>
      </main>
    </div>
  );
}
