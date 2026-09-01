import { NextResponse } from "next/server";
import { createCourse } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可建立課程" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const id = await createCourse(CURRENT_ORG_ID, userId, title);
  return NextResponse.json({ id }, { status: 201 });
}
