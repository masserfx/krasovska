import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/plane-api";

export const revalidate = 300; // ISR: 5 minutes

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Plane Dashboard]", error);
    return NextResponse.json(
      { error: "Failed to fetch Plane data" },
      { status: 502 }
    );
  }
}
