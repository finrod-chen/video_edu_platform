import { NextResponse } from "next/server";
import { createManualStep, getManualSteps } from "@/lib/queries/manuals";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const steps = await getManualSteps(Number(id));
  return NextResponse.json(steps);
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
    return NextResponse.json({ error: "僅限編輯以上權限帳號可新增步驟" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "新步驟";

  const stepId = await createManualStep(Number(id), title);
  return NextResponse.json({ id: stepId }, { status: 201 });
}
