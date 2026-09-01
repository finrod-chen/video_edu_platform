import { NextResponse } from "next/server";
import { createCourseFolder } from "@/lib/queries/courses";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const parentId =
    typeof body?.parentId === "number" && Number.isInteger(body.parentId) ? body.parentId : null;

  const id = await createCourseFolder(CURRENT_ORG_ID, name, parentId);
  return NextResponse.json({ id }, { status: 201 });
}
