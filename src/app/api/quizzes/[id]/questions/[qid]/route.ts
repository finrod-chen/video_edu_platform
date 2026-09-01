import { NextResponse } from "next/server";
import { deleteQuizQuestion, updateQuizQuestion } from "@/lib/queries/quizzes";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const { qid } = await params;
  if (!/^\d+$/.test(qid)) {
    return NextResponse.json({ error: "invalid qid" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯題目" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  await updateQuizQuestion(Number(qid), prompt);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const { qid } = await params;
  if (!/^\d+$/.test(qid)) {
    return NextResponse.json({ error: "invalid qid" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可刪除題目" }, { status: 403 });
  }
  await deleteQuizQuestion(Number(qid));
  return NextResponse.json({ ok: true });
}
