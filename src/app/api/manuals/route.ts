import { NextResponse } from "next/server";
import { createManual } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可建立手冊" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const folderId =
    typeof body?.folderId === "number" && Number.isInteger(body.folderId) ? body.folderId : null;

  const manualId = await createManual(CURRENT_ORG_ID, userId, title, folderId);

  return NextResponse.json({ id: manualId }, { status: 201 });
}
