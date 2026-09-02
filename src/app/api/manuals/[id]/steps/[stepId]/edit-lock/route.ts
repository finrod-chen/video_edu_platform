import { NextResponse } from "next/server";
import { acquireStepLock, releaseStepLock } from "@/lib/queries/stepLocks";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  if (!/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
  }

  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯影片" }, { status: 403 });
  }

  const result = await acquireStepLock(Number(stepId), userId);
  if (!result.ok) {
    return NextResponse.json(
      { error: `${result.info.lockedByName} 正在編輯這支影片，請稍後再試`, lockedByName: result.info.lockedByName },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  if (!/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
  }

  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯影片" }, { status: 403 });
  }

  await releaseStepLock(Number(stepId), userId);
  return NextResponse.json({ ok: true });
}
