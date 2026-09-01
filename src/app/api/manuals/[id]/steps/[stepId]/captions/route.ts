import { NextResponse } from "next/server";
import { getManualStepById, updateManualStep } from "@/lib/queries/manuals";
import { transcribeStep } from "@/lib/captions";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可產生字幕" }, { status: 403 });
  }

  const manualId = Number(id);
  const stepIdNum = Number(stepId);
  const step = await getManualStepById(manualId, stepIdNum);
  if (!step) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!step.videoPath) {
    return NextResponse.json({ error: "此步驟尚未上傳影片" }, { status: 400 });
  }

  await updateManualStep(stepIdNum, { captionStatus: "pending" });

  // Fire-and-forget: the response returns immediately, transcription keeps
  // running on the event loop after this handler returns (see captions.ts).
  void transcribeStep(manualId, stepIdNum);

  return NextResponse.json({ ok: true, status: "pending" });
}
