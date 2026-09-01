import { NextResponse } from "next/server";
import { createManualStep, getManualSteps } from "@/lib/queries/manuals";

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

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "新步驟";

  const stepId = await createManualStep(Number(id), title);
  return NextResponse.json({ id: stepId }, { status: 201 });
}
