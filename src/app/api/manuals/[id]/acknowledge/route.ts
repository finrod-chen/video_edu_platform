import { NextResponse } from "next/server";
import { acknowledgeManual } from "@/lib/queries/acknowledgments";
import { getCurrentUser } from "@/lib/current-viewer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { id: userId } = await getCurrentUser();
  await acknowledgeManual(Number(id), userId);
  return NextResponse.json({ ok: true });
}
