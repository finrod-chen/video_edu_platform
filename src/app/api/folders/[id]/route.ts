import { NextResponse } from "next/server";
import { deleteFolder, renameFolder } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可重新命名資料夾" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  await renameFolder(CURRENT_ORG_ID, Number(id), name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可刪除資料夾" }, { status: 403 });
  }
  await deleteFolder(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
