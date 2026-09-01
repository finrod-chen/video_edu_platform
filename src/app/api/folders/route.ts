import { NextResponse } from "next/server";
import { createFolder } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可建立資料夾" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const parentId =
    typeof body?.parentId === "number" && Number.isInteger(body.parentId) ? body.parentId : null;

  const id = await createFolder(CURRENT_ORG_ID, name, parentId);
  return NextResponse.json({ id }, { status: 201 });
}
