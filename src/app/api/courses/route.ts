import { NextResponse } from "next/server";
import { createCourse } from "@/lib/queries/courses";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const folderId =
    typeof body?.folderId === "number" && Number.isInteger(body.folderId) ? body.folderId : null;

  const id = await createCourse(CURRENT_ORG_ID, title, folderId);
  return NextResponse.json({ id }, { status: 201 });
}
