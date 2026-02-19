import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/types/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const { name, role, is_active, password } = body as {
    name?: string;
    role?: string;
    is_active?: boolean;
    password?: string;
  };

  if (role) {
    const validRoles: UserRole[] = Object.keys(ROLE_HIERARCHY) as UserRole[];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Neplatná role. Povolené hodnoty: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }
  }

  const { rows: existing } = await sql`SELECT * FROM users WHERE id = ${id}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
  }

  const user = existing[0];
  const newName = name ?? user.name;
  const newRole = role ?? user.role;
  const newActive = is_active ?? user.is_active;

  if (password) {
    const hash = await bcrypt.hash(password, 12);
    await sql`
      UPDATE users
      SET name = ${newName}, role = ${newRole}, is_active = ${newActive},
          password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE users
      SET name = ${newName}, role = ${newRole}, is_active = ${newActive},
          updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  const { rows } = await sql`
    SELECT id, email, name, role, is_active, created_at, updated_at
    FROM users WHERE id = ${id}
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  // Prevent deleting yourself
  if (auth.id === id) {
    return NextResponse.json(
      { error: "Nemůžete smazat svůj vlastní účet" },
      { status: 400 }
    );
  }

  await sql`DELETE FROM users WHERE id = ${id}`;
  return new NextResponse(null, { status: 204 });
}
