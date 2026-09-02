import { NextResponse } from "next/server";
import { extensionForMime, saveStepImage } from "@/lib/uploads";
import { getManualStepById, updateManualStep } from "@/lib/queries/manuals";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可上傳圖片" }, { status: 403 });
  }

  const manualId = Number(id);
  const stepIdNum = Number(stepId);
  const step = await getManualStepById(manualId, stepIdNum);
  if (!step) {
    return NextResponse.json({ error: "step not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "僅接受 JPEG／PNG／WebP 圖片" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "檔案太大，單一圖片上限為 20MB" }, { status: 400 });
  }

  const extension = extensionForMime(file.type, "jpg");
  const buffer = Buffer.from(await file.arrayBuffer());
  const imagePath = await saveStepImage(manualId, stepIdNum, buffer, extension);

  await updateManualStep(stepIdNum, {
    mediaType: "image",
    imagePath,
    videoPath: null,
    thumbnailPath: null,
    captionsVtt: null,
    captionStatus: "none",
    durationSeconds: null,
  });

  return NextResponse.json({ imagePath });
}
