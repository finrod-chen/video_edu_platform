import { NextResponse } from "next/server";
import { reorderManualSteps } from "@/lib/queries/manuals";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const stepIds = Array.isArray(body?.stepIds) ? body.stepIds : null;
  if (!stepIds || !stepIds.every((v: unknown) => typeof v === "number")) {
    return NextResponse.json({ error: "stepIds must be an array of numbers" }, { status: 400 });
  }

  await reorderManualSteps(Number(id), stepIds);
  return NextResponse.json({ ok: true });
}
