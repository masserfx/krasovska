"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserX,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Lock,
  RotateCcw,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import type { AppUser, UserRole } from "@/types/auth";
import { USER_ROLE_LABELS, ROLE_HIERARCHY, SECTION_DEFS, getDefaultPermissions } from "@/types/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: UserRole[] = (Object.keys(ROLE_HIERARCHY) as UserRole[]).sort(
  (a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]
);

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  coordinator: "bg-purple-100 text-purple-700 border-purple-200",
  reception: "bg-blue-100 text-blue-700 border-blue-200",
  member: "bg-green-100 text-green-700 border-green-200",
};

const ROLE_DOT: Record<UserRole, string> = {
  admin: "bg-red-500",
  coordinator: "bg-purple-500",
  reception: "bg-blue-500",
  member: "bg-green-500",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("cs-CZ", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Permissions checklist ────────────────────────────────────────────────────

const SECTION_GROUPS = Array.from(new Set(SECTION_DEFS.map((s) => s.group)));

interface PermissionsChecklistProps {
  role: UserRole;
  value: string[];            // current selected section IDs
  onChange: (ids: string[]) => void;
  onReset: () => void;        // reset to role defaults
}

function PermissionsChecklist({ role, value, onChange, onReset }: PermissionsChecklistProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTION_GROUPS.map((g) => [g, true]))
  );

  if (role === "admin") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
        <Lock className="h-4 w-4 text-red-500 shrink-0" />
        <p className="text-sm text-red-700 font-medium">
          Administrátor má přístup ke všem sekcím
        </p>
      </div>
    );
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  function toggleGroup(group: string) {
    const ids = SECTION_DEFS.filter((s) => s.group === group).map((s) => s.id);
    const allChecked = ids.every((id) => value.includes(id));
    if (allChecked) {
      onChange(value.filter((v) => !ids.includes(v)));
    } else {
      onChange([...new Set([...value, ...ids])]);
    }
  }

  const defaults = getDefaultPermissions(role);
  const isDefault = JSON.stringify([...value].sort()) === JSON.stringify([...defaults].sort());

  return (
    <div className="space-y-1">
      {/* Reset button */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted">Zaškrtni sekce dostupné tomuto uživateli</p>
        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className="flex items-center gap-1 text-xs text-muted hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Obnovit výchozí přístupy pro tuto roli"
        >
          <RotateCcw className="h-3 w-3" />
          Výchozí pro roli
        </button>
      </div>

      {SECTION_GROUPS.map((group) => {
        const groupSections = SECTION_DEFS.filter((s) => s.group === group);
        const checkedCount = groupSections.filter((s) => value.includes(s.id)).length;
        const allChecked = checkedCount === groupSections.length;
        const someChecked = checkedCount > 0 && !allChecked;
        const isOpen = openGroups[group] ?? true;

        return (
          <div key={group} className="rounded-lg border border-border overflow-hidden">
            {/* Group header */}
            <button
              type="button"
              onClick={() => setOpenGroups((prev) => ({ ...prev, [group]: !isOpen }))}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left"
            >
              {isOpen
                ? <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0" />
                : <ChevronRight className="h-3.5 w-3.5 text-muted shrink-0" />
              }
              <span className="text-xs font-semibold text-foreground flex-1">{group}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleGroup(group); }}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                  allChecked
                    ? "bg-primary/10 text-primary"
                    : someChecked
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-muted"
                }`}
              >
                {checkedCount}/{groupSections.length}
              </button>
            </button>

            {/* Items */}
            {isOpen && (
              <div className="divide-y divide-border/50">
                {groupSections.map((section) => {
                  const checked = value.includes(section.id);
                  const isDefault = defaults.includes(section.id);
                  return (
                    <label
                      key={section.id}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                        checked ? "bg-blue-50/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(section.id)}
                        className="h-3.5 w-3.5 rounded border-border text-primary accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{section.label}</span>
                          {isDefault && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-muted leading-none">výchozí</span>
                          )}
                        </div>
                        <p className="text-xs text-muted truncate">{section.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── User modal ───────────────────────────────────────────────────────────────

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  section_permissions: string[] | null;
}

interface ModalProps {
  user: AppUser | null;
  onSave: (data: UserFormData) => Promise<void>;
  onClose: () => void;
}

function UserModal({ user, onSave, onClose }: ModalProps) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "member");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permissions: use explicit if set, else compute from role
  const [permissions, setPermissions] = useState<string[]>(() =>
    user?.section_permissions ?? getDefaultPermissions(user?.role ?? "member")
  );
  // Track if admin explicitly customised (vs using defaults)
  const [customised, setCustomised] = useState(!!user?.section_permissions);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleRoleChange(r: UserRole) {
    setRole(r);
    // Auto-reset permissions to new role's defaults (unless already customised)
    if (!customised) {
      setPermissions(getDefaultPermissions(r));
    }
  }

  function handlePermissionsChange(ids: string[]) {
    setPermissions(ids);
    setCustomised(true);
  }

  function handleReset() {
    setPermissions(getDefaultPermissions(role));
    setCustomised(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (!isEdit && !password) { setError("Heslo je povinné"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        email: email.trim(),
        name: name.trim(),
        password,
        role,
        // null = use role defaults, array = explicit custom
        section_permissions: customised ? permissions : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se uložit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-border flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              {isEdit ? "Upravit uživatele" : "Nový uživatel"}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/5 border border-danger/20 px-3 py-2 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Jméno *</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jméno a příjmení"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEdit}
                placeholder="jmeno@krasovska.cz"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-muted"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Heslo {isEdit ? <span className="font-normal">(prázdné = beze změny)</span> : "*"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEdit}
                  placeholder={isEdit ? "Nové heslo (volitelné)" : "Minimálně 8 znaků"}
                  className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Role *</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      role === r
                        ? "border-primary bg-blue-50 text-primary font-medium"
                        : "border-border text-muted hover:border-primary/40"
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${ROLE_DOT[r]}`} />
                    {USER_ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted">Přístupy do sekcí</label>
                {customised && role !== "admin" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    upraveno
                  </span>
                )}
              </div>
              <PermissionsChecklist
                role={role}
                value={permissions}
                onChange={handlePermissionsChange}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !email.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? "Ukládám…" : isEdit ? "Uložit změny" : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalUser, setModalUser] = useState<AppUser | null | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(await res.text());
      setUsers(await res.json());
    } catch {
      setError("Nepodařilo se načíst uživatele.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(data: UserFormData) {
    if (modalUser) {
      const body: Record<string, unknown> = {
        name: data.name,
        role: data.role,
        section_permissions: data.section_permissions,
      };
      if (data.password) body.password = data.password;
      const res = await fetch(`/api/users/${modalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
      const updated: AppUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } else {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
      const created: AppUser = await res.json();
      setUsers((prev) => [...prev, created]);
    }
  }

  async function handleToggleActive(user: AppUser) {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!res.ok) throw new Error();
      const updated: AppUser = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      setError("Nepodařilo se změnit stav uživatele.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(user: AppUser) {
    if (!confirm(`Opravdu smazat uživatele „${user.name}"? Tato akce je nevratná.`)) return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se smazat uživatele.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="users" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Správa uživatelů</h1>
              <p className="text-sm text-muted">Přístupy do systému Hala Krašovská</p>
            </div>
          </div>
          <button
            onClick={() => setModalUser(null)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Přidat uživatele
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted/40" />
            <p className="text-sm font-medium text-foreground">Žádní uživatelé</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Uživatel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Přístupy</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Vytvořen</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wide">Stav</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wide">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const effectivePerms = user.section_permissions ?? getDefaultPermissions(user.role);
                  const isCustom = !!user.section_permissions;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors hover:bg-gray-50/50 ${!user.is_active ? "opacity-50" : ""}`}
                    >
                      {/* Name + email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${ROLE_DOT[user.role]}`}>
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {USER_ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>

                      {/* Section count */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {user.role === "admin" ? (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Vše
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${
                            isCustom
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-muted"
                          }`}>
                            {effectivePerms.length} sekcí
                            {isCustom && <span className="font-medium">· vlastní</span>}
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.id}
                          title={user.is_active ? "Deaktivovat" : "Aktivovat"}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            user.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : user.is_active ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          {user.is_active ? "Aktivní" : "Neaktivní"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModalUser(user)}
                            title="Upravit"
                            className="rounded-lg p-1.5 text-muted hover:bg-gray-100 hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            title="Smazat"
                            className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors disabled:opacity-50"
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 text-xs text-muted bg-gray-50/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              {users.filter((u) => u.is_active).length} aktivních
              {users.filter((u) => !u.is_active).length > 0 && (
                <> · {users.filter((u) => !u.is_active).length} neaktivních</>
              )}
              · celkem {users.length}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          onSave={handleSave}
          onClose={() => setModalUser(undefined)}
        />
      )}
    </div>
  );
}
