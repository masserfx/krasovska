import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { ensureTable } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTable();
    const { id } = await params;

    const { rows } = await sql`
      SELECT slug FROM products WHERE id = ${id} AND is_active = true
    `;

    if (rows.length === 0) {
      return NextResponse.redirect(new URL("/eshop", _request.url));
    }

    return NextResponse.redirect(new URL(`/eshop/${rows[0].slug}`, _request.url));
  } catch {
    return NextResponse.redirect(new URL("/eshop", _request.url));
  }
}
