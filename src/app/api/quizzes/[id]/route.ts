import { NextResponse } from "next/server";
import { deleteQuiz, getQuizById, updateQuiz } from "@/lib/queries/quizzes";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";
import type { ManualStatus } from "@/types/tebiki";

const VALID_STATUSES: ManualStatus[] = ["published", "draft", "trashed"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const quiz = await getQuizById(CURRENT_ORG_ID, Number(id));
  if (!quiz) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(quiz);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯測驗" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fields: { title?: string; passScore?: number; status?: ManualStatus } = {};
  if (typeof body?.title === "string" && body.title.trim()) {
    fields.title = body.title.trim();
  }
  if (typeof body?.passScore === "number" && body.passScore >= 0 && body.passScore <= 100) {
    fields.passScore = Math.round(body.passScore);
  }
  if (typeof body?.status === "string" && VALID_STATUSES.includes(body.status as ManualStatus)) {
    fields.status = body.status as ManualStatus;
  }

  await updateQuiz(CURRENT_ORG_ID, Number(id), userId, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  const quiz = await getQuizById(CURRENT_ORG_ID, Number(id));
  if (!quiz) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const canPermanentlyDelete = isAdmin(role) || (isEditorOrAbove(role) && !quiz.hasBeenPublished);
  if (!canPermanentlyDelete) {
    return NextResponse.json({ error: "此測驗曾經發布過，僅限管理員權限帳號可永久刪除" }, { status: 403 });
  }

  await deleteQuiz(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
