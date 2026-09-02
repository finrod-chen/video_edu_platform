import { NextResponse } from "next/server";
import { deleteManualAttachment } from "@/lib/queries/attachments";
import { deleteManualAttachmentFile } from "@/lib/uploads";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { id, attachmentId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(attachmentId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可刪除附件" }, { status: 403 });
  }

  await deleteManualAttachmentFile(Number(id), Number(attachmentId));
  await deleteManualAttachment(CURRENT_ORG_ID, Number(attachmentId));
  return NextResponse.json({ ok: true });
}
