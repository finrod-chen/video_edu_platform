import { NextResponse } from "next/server";
import { createManual } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID, getCurrentUserId } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const manualId = await createManual(CURRENT_ORG_ID, userId, title);

  return NextResponse.json({ id: manualId }, { status: 201 });
}
