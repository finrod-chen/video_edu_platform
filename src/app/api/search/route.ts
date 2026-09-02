import { NextResponse } from "next/server";
import { searchContent } from "@/lib/queries/search";
import { CURRENT_ORG_ID, getCurrentUser } from "@/lib/current-viewer";

export async function GET(request: Request) {
  await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json([]);
  }
  const results = await searchContent(CURRENT_ORG_ID, q);
  return NextResponse.json(results);
}
