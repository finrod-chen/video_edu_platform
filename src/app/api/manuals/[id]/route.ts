import { NextResponse } from "next/server";
import { getManualById, updateManual } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID, getCurrentUserId } from "@/lib/current-viewer";
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
