import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/docs/CEO_BRIEFING.html");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Briefing not found" }, { status: 404 });
    }

    const html = fs.readFileSync(filePath, "utf-8");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("GET /api/bistro/briefing error:", error);
    return NextResponse.json({ error: "Failed to read briefing" }, { status: 500 });
  }
}
