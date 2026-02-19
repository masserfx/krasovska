import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Returns fresh section_permissions for the current user from DB. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { rows } = await sql`
    SELECT section_permissions FROM users WHERE id = ${session.user.id}
  `;

  return NextResponse.json({
    section_permissions: rows[0]?.section_permissions ?? null,
  });
}
