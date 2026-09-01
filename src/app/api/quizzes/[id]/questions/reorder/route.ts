import { NextResponse } from "next/server";
import { reorderQuizQuestions } from "@/lib/queries/quizzes";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可調整題目順序" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const questionIds = Array.isArray(body?.questionIds) ? body.questionIds : null;
  if (!questionIds || !questionIds.every((v: unknown) => typeof v === "number")) {
    return NextResponse.json({ error: "questionIds must be an array of numbers" }, { status: 400 });
  }
  await reorderQuizQuestions(Number(id), questionIds);
  return NextResponse.json({ ok: true });
}
