import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

const COOKIE_NAME = "impersonate-uid";

/** Returns fresh section_permissions for the current user from DB. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  // Impersonation: admin with cookie sees target user's data
  if (session.user.role === "admin") {
    const cookieStore = await cookies();
    const targetId = cookieStore.get(COOKIE_NAME)?.value;

    if (targetId) {
      const { rows } = await sql`
        SELECT id, name, email, role, section_permissions
        FROM users WHERE id = ${targetId}
      `;

      if (rows.length > 0) {
        return NextResponse.json({
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
          section_permissions: rows[0].section_permissions ?? null,
          impersonating: true,
        });
      }

      // Target not found → clean up stale cookie
      cookieStore.delete(COOKIE_NAME);
    }
  }

  const { rows } = await sql`
    SELECT section_permissions FROM users WHERE id = ${session.user.id}
  `;

  return NextResponse.json({
    section_permissions: rows[0]?.section_permissions ?? null,
  });
}
