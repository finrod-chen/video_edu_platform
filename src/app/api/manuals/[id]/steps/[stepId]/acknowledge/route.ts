import { NextResponse } from "next/server";
import { acknowledgeStep } from "@/lib/queries/acknowledgments";
import { getCurrentUser } from "@/lib/current-viewer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { id: userId } = await getCurrentUser();
  await acknowledgeStep(Number(stepId), userId);
  return NextResponse.json({ ok: true });
}
