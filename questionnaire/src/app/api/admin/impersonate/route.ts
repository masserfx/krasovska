import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth, isAuthError } from "@/lib/auth-helpers";

const COOKIE_NAME = "impersonate-uid";
const MAX_AGE = 3600; // 1 hour

export async function POST(req: Request) {
  const user = await requireAuth("admin");
  if (isAuthError(user)) return user;

  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId je povinný" }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "Nelze impersonovat sebe" }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT id, name, email, role, section_permissions
    FROM users
    WHERE id = ${userId}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
  }

  const target = rows[0];

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return NextResponse.json({
    id: target.id,
    name: target.name,
    email: target.email,
    role: target.role,
    section_permissions: target.section_permissions,
    impersonating: true,
  });
}

export async function DELETE() {
  const user = await requireAuth("admin");
  if (isAuthError(user)) return user;

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
