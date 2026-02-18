import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const id = searchParams.get("id") || "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hala-krasovska.vercel.app";

  if (status === "ok") {
    return NextResponse.redirect(`${baseUrl}/eshop/dekujeme?order=${id}`);
  }

  if (status === "cancel") {
    return NextResponse.redirect(`${baseUrl}/eshop/kosik?cancelled=1`);
  }

  // pending — redirect to thank you page, payment might still be processing
  return NextResponse.redirect(`${baseUrl}/eshop/dekujeme?order=${id}&pending=1`);
}
