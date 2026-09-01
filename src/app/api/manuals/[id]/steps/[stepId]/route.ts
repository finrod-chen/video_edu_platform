import { NextResponse } from "next/server";
import { deleteManualStep, updateManualStep } from "@/lib/queries/manuals";
import { deleteManualStepFiles } from "@/lib/uploads";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  if (!/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
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
  await deleteManualStep(Number(stepId));
  await deleteManualStepFiles(Number(id), Number(stepId));
  return NextResponse.json({ ok: true });
}
