import { NextResponse } from "next/server";
import { getStepsNeedingCaptions, updateManualStep } from "@/lib/queries/manuals";
import { transcribeStep } from "@/lib/captions";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

async function runSequentially(targets: { manualId: number; stepId: number }[]) {
  // Sequential on purpose -- one Whisper call at a time so a large backlog
  // doesn't fan out into dozens of concurrent API calls / open file handles.
  for (const { manualId, stepId } of targets) {
    await transcribeStep(manualId, stepId);
  }
}

export async function POST() {
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可批次產生字幕" }, { status: 403 });
  }

  const targets = await getStepsNeedingCaptions(CURRENT_ORG_ID);
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  await Promise.all(targets.map(({ stepId }) => updateManualStep(stepId, { captionStatus: "pending" })));

  // Fire-and-forget: process the backlog sequentially in the background.
  void runSequentially(targets);

  return NextResponse.json({ ok: true, count: targets.length });
}
