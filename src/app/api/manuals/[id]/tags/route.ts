import { NextResponse } from "next/server";
import { addManualTag, getTagsForManual } from "@/lib/queries/tags";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const tags = await getTagsForManual(Number(id));
  return NextResponse.json(tags);
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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const tag = await addManualTag(CURRENT_ORG_ID, Number(id), name);
  return NextResponse.json(tag, { status: 201 });
}
