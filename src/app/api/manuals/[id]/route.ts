import { NextResponse } from "next/server";
import { deleteManual, getManualById, updateManual } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID, getCurrentUser, getCurrentUserId, isAdmin } from "@/lib/current-viewer";
import { deleteManualFiles } from "@/lib/uploads";
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
  const manual = await getManualById(CURRENT_ORG_ID, Number(id));
  if (!manual) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(manual);
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
  const fields: { title?: string; description?: string; status?: ManualStatus } = {};

  if (typeof body?.title === "string" && body.title.trim()) {
    fields.title = body.title.trim();
  }
  if (typeof body?.description === "string") {
    fields.description = body.description;
  }
  if (typeof body?.status === "string" && VALID_STATUSES.includes(body.status as ManualStatus)) {
    fields.status = body.status as ManualStatus;
  }

  const userId = await getCurrentUserId();
  await updateManual(CURRENT_ORG_ID, Number(id), userId, fields);

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
    return NextResponse.json({ error: "僅限行政權限帳號可永久刪除手冊" }, { status: 403 });
  }

  const manualId = Number(id);
  await deleteManual(CURRENT_ORG_ID, manualId);
  await deleteManualFiles(manualId);

  return NextResponse.json({ ok: true });
}
