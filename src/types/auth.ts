export type UserRole = "admin" | "reception" | "member";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrátor",
  reception: "Recepce",
  member: "Člen",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 2,
  reception: 1,
  member: 0,
};
