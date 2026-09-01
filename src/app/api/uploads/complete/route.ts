import { NextResponse } from "next/server";
import { assembleUpload, extensionForMime, isValidUploadId, saveThumbnail } from "@/lib/uploads";
import { getManualStepById, updateManualStep } from "@/lib/queries/manuals";

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadId = formData.get("uploadId");
  const manualId = formData.get("manualId");
  const stepId = formData.get("stepId");
  const mimeType = formData.get("mimeType");
  const durationSeconds = formData.get("durationSeconds");
  const thumbnail = formData.get("thumbnail");

  if (typeof uploadId !== "string" || !isValidUploadId(uploadId)) {
    return NextResponse.json({ error: "invalid uploadId" }, { status: 400 });
  }
  if (typeof manualId !== "string" || !/^\d+$/.test(manualId)) {
    return NextResponse.json({ error: "invalid manualId" }, { status: 400 });
  }
  if (typeof stepId !== "string" || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
  }

  const manualIdNum = Number(manualId);
  const stepIdNum = Number(stepId);

  const step = await getManualStepById(manualIdNum, stepIdNum);
  if (!step) {
    return NextResponse.json({ error: "step not found" }, { status: 404 });
  }

  const extension = extensionForMime(typeof mimeType === "string" ? mimeType : "");
  const videoPath = await assembleUpload(uploadId, manualIdNum, stepIdNum, extension);

  let thumbnailPath: string | undefined;
  if (thumbnail instanceof Blob) {
    const buffer = Buffer.from(await thumbnail.arrayBuffer());
    thumbnailPath = await saveThumbnail(manualIdNum, stepIdNum, buffer);
  }

  await updateManualStep(stepIdNum, {
    videoPath,
    ...(thumbnailPath ? { thumbnailPath } : {}),
    ...(typeof durationSeconds === "string" && /^\d+$/.test(durationSeconds)
      ? { durationSeconds: Number(durationSeconds) }
      : {}),
  });

  return NextResponse.json({ ok: true, videoPath, thumbnailPath });
}
