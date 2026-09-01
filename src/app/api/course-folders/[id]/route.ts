import { NextResponse } from "next/server";
import { deleteCourseFolder, renameCourseFolder } from "@/lib/queries/courses";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export async function PATCH(
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
  await renameCourseFolder(CURRENT_ORG_ID, Number(id), name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  await deleteCourseFolder(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
