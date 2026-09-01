import { NextResponse } from "next/server";
import { getQuizById, submitQuizAttempt } from "@/lib/queries/quizzes";
import { CURRENT_ORG_ID, getCurrentUser } from "@/lib/current-viewer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { id: userId } = await getCurrentUser();
  const quiz = await getQuizById(CURRENT_ORG_ID, Number(id));
  if (!quiz || quiz.status !== "published") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const answers = Array.isArray(body?.answers)
    ? body.answers.filter(
        (a: unknown): a is { questionId: number; choiceId: number } =>
          typeof a === "object" &&
          a !== null &&
          typeof (a as Record<string, unknown>).questionId === "number" &&
          typeof (a as Record<string, unknown>).choiceId === "number"
      )
    : [];

  const result = await submitQuizAttempt(Number(id), userId, quiz.passScore, answers);
  return NextResponse.json(result, { status: 201 });
}
