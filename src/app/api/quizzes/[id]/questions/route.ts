import { NextResponse } from "next/server";
import { createQuizQuestion, getQuizQuestions } from "@/lib/queries/quizzes";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  const questions = await getQuizQuestions(Number(id));

  if (isEditorOrAbove(role)) {
    return NextResponse.json(questions);
  }

  // Employees taking the quiz must never receive which choice is correct.
  const sanitized = questions.map((q) => ({
    ...q,
    choices: q.choices.map(({ id: choiceId, label }) => ({ id: choiceId, label })),
  }));
  return NextResponse.json(sanitized);
}

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
    return NextResponse.json({ error: "僅限編輯以上權限帳號可新增題目" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" && body.prompt.trim() ? body.prompt.trim() : "新題目";

  const questionId = await createQuizQuestion(Number(id), prompt);
  return NextResponse.json({ id: questionId }, { status: 201 });
}
