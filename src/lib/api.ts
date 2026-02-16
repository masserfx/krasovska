import {
  FormData,
  QuestionnaireMetadata,
  Project,
  Task,
  AnalysisSnapshot,
  DashboardData,
  ProjectCategory,
  ProjectStatus,
} from "@/types";
import { AuditEntry } from "@/lib/audit";

// --- Questionnaires ---

const BASE = "/api/questionnaires";

export async function fetchQuestionnaires(): Promise<QuestionnaireMetadata[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Nepodařilo se načíst dotazníky");
  return res.json();
}

export async function fetchQuestionnaire(
  id: string
): Promise<{ id: string; title: string; data: FormData }> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Dotazník nenalezen");
  return res.json();
}

export async function createQuestionnaire(
  title: string
): Promise<{ id: string }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Nepodařilo se vytvořit dotazník");
  return res.json();
}

export async function updateQuestionnaire(
  id: string,
  data: FormData,
  title?: string
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, title }),
  });
  if (!res.ok) throw new Error("Nepodařilo se uložit dotazník");
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Nepodařilo se smazat dotazník");
}

// --- Projects ---

export async function fetchProjects(params?: {
  questionnaire_id?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
}): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.questionnaire_id) query.set("questionnaire_id", params.questionnaire_id);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  const res = await fetch(`/api/projects${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst projekty");
  return res.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Projekt nenalezen");
  return res.json();
}

export async function createProject(
  data: Omit<Project, "id" | "created_at" | "updated_at" | "task_count" | "done_count">
): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se vytvořit projekt");
  return res.json();
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "created_at" | "updated_at">>
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se aktualizovat projekt");
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Nepodařilo se smazat projekt");
}

// --- Tasks ---

export async function fetchTasks(projectId: string): Promise<Task[]> {
  const res = await fetch(`/api/projects/${projectId}/tasks`);
  if (!res.ok) throw new Error("Nepodařilo se načíst úkoly");
  return res.json();
}

export async function createTask(
  projectId: string,
  data: Omit<Task, "id" | "project_id" | "created_at" | "updated_at">
): Promise<Task> {
  const res = await fetch(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se vytvořit úkol");
  return res.json();
}

export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "project_id" | "created_at" | "updated_at">>
): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Nepodařilo se aktualizovat úkol");
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Nepodařilo se smazat úkol");
}

// --- Analysis ---

export async function fetchAnalysis(questionnaireId: string): Promise<AnalysisSnapshot> {
  const res = await fetch(`/api/analysis/${questionnaireId}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst analýzu");
  return res.json();
}

export async function regenerateAnalysis(questionnaireId: string): Promise<AnalysisSnapshot> {
  const res = await fetch(`/api/analysis/${questionnaireId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Nepodařilo se vygenerovat analýzu");
  return res.json();
}

// --- Audit ---

export async function fetchAuditLog(params?: {
  questionnaire_id?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditEntry[]> {
  const query = new URLSearchParams();
  if (params?.questionnaire_id) query.set("questionnaire_id", params.questionnaire_id);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await fetch(`/api/audit${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst audit log");
  return res.json();
}

// --- Dashboard ---

export async function fetchDashboard(questionnaireId: string): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard/${questionnaireId}`);
  if (!res.ok) throw new Error("Nepodařilo se načíst dashboard");
  return res.json();
}
