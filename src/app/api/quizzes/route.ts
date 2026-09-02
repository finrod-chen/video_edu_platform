import { NextResponse } from "next/server";
import { createQuiz } from "@/lib/queries/quizzes";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";
import type { QuizScope } from "@/types/models";

export async function POST(request: Request) {
  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可建立測驗" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const scope = body?.scope === "manual" || body?.scope === "course" ? (body.scope as QuizScope) : null;
  const manualId =
    scope === "manual" && typeof body?.manualId === "number" && Number.isInteger(body.manualId)
      ? body.manualId
      : null;
  const courseId =
    scope === "course" && typeof body?.courseId === "number" && Number.isInteger(body.courseId)
      ? body.courseId
      : null;
  const passScore =
    typeof body?.passScore === "number" && body.passScore >= 0 && body.passScore <= 100
      ? Math.round(body.passScore)
      : 60;

  if (!title || !scope || (scope === "manual" && !manualId) || (scope === "course" && !courseId)) {
    return NextResponse.json({ error: "title, scope, and the matching manualId/courseId are required" }, { status: 400 });
  }

  const id = await createQuiz(CURRENT_ORG_ID, userId, { scope, manualId, courseId, title, passScore });
  return NextResponse.json({ id }, { status: 201 });
}
