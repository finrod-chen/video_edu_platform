import { NextResponse } from "next/server";
import { createQuizChoice, setCorrectChoice } from "@/lib/queries/quizzes";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const { qid } = await params;
  if (!/^\d+$/.test(qid)) {
    return NextResponse.json({ error: "invalid qid" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可新增選項" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const isCorrect = body?.isCorrect === true;
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const id = await createQuizChoice(Number(qid), label, isCorrect);
  if (isCorrect) {
    await setCorrectChoice(Number(qid), id);
  }
  return NextResponse.json({ id }, { status: 201 });
}
