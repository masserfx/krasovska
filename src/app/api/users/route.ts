import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureTable } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/types/auth";

export async function GET() {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  await ensureTable();
  const { rows } = await sql`
    SELECT id, email, name, role, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const auth = await requireAuth("admin");
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { email, name, password, role } = body as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  };

  if (!email || !name || !password || !role) {
    return NextResponse.json(
      { error: "email, name, password a role jsou povinné" },
      { status: 400 }
    );
  }

  const validRoles: UserRole[] = Object.keys(ROLE_HIERARCHY) as UserRole[];
  if (!validRoles.includes(role as UserRole)) {
    return NextResponse.json(
      { error: `Neplatná role. Povolené hodnoty: ${validRoles.join(", ")}` },
      { status: 400 }
    );
  }

  await ensureTable();

  const { rows: existing } = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Uživatel s tímto e-mailem již existuje" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, ${role})
    RETURNING id, email, name, role, is_active, created_at
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
