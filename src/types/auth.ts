export type UserRole = "admin" | "coordinator" | "reception" | "member";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  section_permissions: string[] | null;
  created_at: string;
  updated_at: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrátor",
  coordinator: "Koordinátor projektů",
  reception: "Recepce",
  member: "Člen",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 2,
  coordinator: 1,
  reception: 1,
  member: 0,
};

// ─── Section access definitions ───────────────────────────────────────────────

export interface SectionDef {
  id: string;
  label: string;
  description: string;
  group: string;
  defaultRoles: UserRole[];
}

export const SECTION_DEFS: SectionDef[] = [
  // Projektové řízení
  { id: "dashboard",    label: "Dashboard",         description: "Přehled projektů a statistik",         group: "Projektové řízení", defaultRoles: ["admin", "coordinator", "member"] },
  { id: "projects",     label: "Projekty",           description: "Správa projektů a úkolů",              group: "Projektové řízení", defaultRoles: ["admin", "coordinator", "member"] },
  { id: "bistro",       label: "Bistro",             description: "Kanban, Gantt, KPIs a CEO briefing",   group: "Projektové řízení", defaultRoles: ["admin", "coordinator"] },
  // Dotazníky
  { id: "questionnaire", label: "Dotazník",          description: "Vyplňování strategického dotazníku",   group: "Dotazníky",         defaultRoles: ["admin", "coordinator", "reception", "member"] },
  { id: "sessions",     label: "Relace",             description: "Správa dotazníkových sessions",        group: "Dotazníky",         defaultRoles: ["admin"] },
  { id: "analysis",     label: "Analýza",            description: "Analýza výsledků dotazníku",           group: "Dotazníky",         defaultRoles: ["admin"] },
  // E-shop
  { id: "eshop",        label: "E-shop",             description: "Veřejný obchod haly",                  group: "E-shop",            defaultRoles: ["admin", "coordinator", "reception", "member"] },
  { id: "objednavky",   label: "Objednávky",         description: "Správa e-shop objednávek",             group: "E-shop",            defaultRoles: ["admin", "reception"] },
  { id: "eshop-admin",  label: "Správa produktů",    description: "Přidávání a editace produktů",         group: "E-shop",            defaultRoles: ["admin"] },
  // Administrace
  { id: "users",        label: "Správa uživatelů",   description: "Přístupy a role uživatelů",            group: "Administrace",      defaultRoles: ["admin"] },
  { id: "audit",        label: "Audit log",          description: "Přehled editací a aktivit",            group: "Administrace",      defaultRoles: ["admin"] },
];

/** Returns default section IDs for a given role. */
export function getDefaultPermissions(role: UserRole): string[] {
  if (role === "admin") return SECTION_DEFS.map((s) => s.id);
  return SECTION_DEFS.filter((s) => s.defaultRoles.includes(role)).map((s) => s.id);
}
