import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/types/auth";

export async function requireAuth(requiredRole?: UserRole) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Nepřihlášen" },
      { status: 401 }
    );
  }

  if (
    requiredRole &&
    ROLE_HIERARCHY[session.user.role] < ROLE_HIERARCHY[requiredRole]
  ) {
    return NextResponse.json(
      { error: "Nedostatečná oprávnění" },
      { status: 403 }
    );
  }

  return session.user;
}

export function isAuthError(
  result: ReturnType<typeof NextResponse.json> | { id: string; email: string; name: string; role: UserRole }
): result is NextResponse {
  return result instanceof NextResponse;
}
