import { NextResponse } from "next/server";
import { deleteCourse, getCourseById, updateCourse } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin } from "@/lib/current-viewer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const course = await getCourseById(CURRENT_ORG_ID, Number(id));
  if (!course) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(course);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const fields: { title?: string; folderId?: number | null } = {};
  if (typeof body?.title === "string" && body.title.trim()) {
    fields.title = body.title.trim();
  }
  if (body?.folderId === null || typeof body?.folderId === "number") {
    fields.folderId = body.folderId;
  }
  await updateCourse(CURRENT_ORG_ID, Number(id), fields);
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
  const { role } = await getCurrentUser();
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "僅限行政權限帳號可刪除課程" }, { status: 403 });
  }
  await deleteCourse(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
