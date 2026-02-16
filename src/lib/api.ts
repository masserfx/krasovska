import { FormData, QuestionnaireMetadata } from "@/types";

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
