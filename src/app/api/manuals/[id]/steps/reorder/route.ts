import { NextResponse } from "next/server";
import { reorderManualSteps } from "@/lib/queries/manuals";
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
    return NextResponse.json({ error: "僅限編輯以上權限帳號可調整步驟順序" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const stepIds = Array.isArray(body?.stepIds) ? body.stepIds : null;
  if (!stepIds || !stepIds.every((v: unknown) => typeof v === "number")) {
    return NextResponse.json({ error: "stepIds must be an array of numbers" }, { status: 400 });
  }

  await reorderManualSteps(Number(id), stepIds);
  return NextResponse.json({ ok: true });
}
