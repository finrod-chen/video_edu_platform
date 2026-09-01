import { NextResponse } from "next/server";
import { deleteManualStep, getManualStepById, updateManualStep } from "@/lib/queries/manuals";
import { deleteManualStepFiles } from "@/lib/uploads";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可查看步驟" }, { status: 403 });
  }

  const step = await getManualStepById(Number(id), Number(stepId));
  if (!step) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(step);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  if (!/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯步驟" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fields: { title?: string } = {};
  if (typeof body?.title === "string" && body.title.trim()) {
    fields.title = body.title.trim();
  }

  await updateManualStep(Number(stepId), fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可刪除步驟" }, { status: 403 });
  }

  await deleteManualStep(Number(stepId));
  await deleteManualStepFiles(Number(id), Number(stepId));
  return NextResponse.json({ ok: true });
}
