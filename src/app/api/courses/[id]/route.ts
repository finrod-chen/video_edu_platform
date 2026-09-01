import { NextResponse } from "next/server";
import { deleteCourse, getCourseById, updateCourse } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";
import type { ManualStatus } from "@/types/tebiki";

const VALID_STATUSES: ManualStatus[] = ["published", "draft", "trashed"];

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

  const { id: userId, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯課程" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fields: { title?: string; status?: ManualStatus } = {};
  if (typeof body?.title === "string" && body.title.trim()) {
    fields.title = body.title.trim();
  }
  if (typeof body?.status === "string" && VALID_STATUSES.includes(body.status as ManualStatus)) {
    fields.status = body.status as ManualStatus;
  }

  await updateCourse(CURRENT_ORG_ID, Number(id), userId, fields);
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
  const course = await getCourseById(CURRENT_ORG_ID, Number(id));
  if (!course) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const canPermanentlyDelete = isAdmin(role) || (isEditorOrAbove(role) && !course.hasBeenPublished);
  if (!canPermanentlyDelete) {
    return NextResponse.json({ error: "此課程曾經發布過，僅限管理員權限帳號可永久刪除" }, { status: 403 });
  }

  await deleteCourse(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
