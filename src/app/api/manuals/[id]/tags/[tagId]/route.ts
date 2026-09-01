import { NextResponse } from "next/server";
import { removeManualTag } from "@/lib/queries/tags";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(tagId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  await removeManualTag(Number(id), Number(tagId));
  return NextResponse.json({ ok: true });
}
