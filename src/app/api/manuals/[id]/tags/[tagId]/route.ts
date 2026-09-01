import { NextResponse } from "next/server";
import { removeManualTag } from "@/lib/queries/tags";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(tagId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可刪除標籤" }, { status: 403 });
  }
  await removeManualTag(Number(id), Number(tagId));
  return NextResponse.json({ ok: true });
}
