import { NextResponse } from "next/server";
import { deleteQuizChoice, setCorrectChoice, updateQuizChoiceLabel } from "@/lib/queries/quizzes";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; qid: string; cid: string }> }
) {
  const { qid, cid } = await params;
  if (!/^\d+$/.test(qid) || !/^\d+$/.test(cid)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯選項" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.label === "string" && body.label.trim()) {
    await updateQuizChoiceLabel(Number(cid), body.label.trim());
  }
  if (body?.isCorrect === true) {
    await setCorrectChoice(Number(qid), Number(cid));
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string; cid: string }> }
) {
  const { cid } = await params;
  if (!/^\d+$/.test(cid)) {
    return NextResponse.json({ error: "invalid cid" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可刪除選項" }, { status: 403 });
  }
  await deleteQuizChoice(Number(cid));
  return NextResponse.json({ ok: true });
}
