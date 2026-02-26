import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureTable } from "@/lib/db";

export async function POST() {
  try {
    await ensureTable();

    const { rows: existing } = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Admin uživatel již existuje" },
        { status: 409 }
      );
    }

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME || "Administrátor";

    if (!email || !password) {
      return NextResponse.json(
        { error: "SEED_ADMIN_EMAIL a SEED_ADMIN_PASSWORD musí být nastaveny" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { rows } = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${passwordHash}, ${name}, 'admin')
      RETURNING id, email, name, role, created_at
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/seed error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se vytvořit admin uživatele" },
      { status: 500 }
    );
  }
}
