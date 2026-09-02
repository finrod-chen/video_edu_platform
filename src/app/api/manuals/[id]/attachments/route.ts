import { NextResponse } from "next/server";
import {
  createManualAttachment,
  listManualAttachments,
  setManualAttachmentFilePath,
} from "@/lib/queries/attachments";
import { saveManualAttachment } from "@/lib/uploads";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const attachments = await listManualAttachments(Number(id));
  return NextResponse.json(attachments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可上傳附件" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "僅接受 PDF 檔案" }, { status: 400 });
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: "檔案太大，單一附件上限為 50MB" }, { status: 400 });
  }

  const originalFilename = file instanceof File ? file.name : "attachment.pdf";
  const manualId = Number(id);
  const attachmentId = await createManualAttachment(CURRENT_ORG_ID, manualId, userId, {
    originalFilename,
    fileSize: file.size,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveManualAttachment(manualId, attachmentId, buffer);
  await setManualAttachmentFilePath(attachmentId, filePath);

  return NextResponse.json(
    { id: String(attachmentId), manualId: id, fileName: originalFilename, fileSize: file.size },
    { status: 201 }
  );
}
