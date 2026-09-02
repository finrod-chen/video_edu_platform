import { NextResponse } from "next/server";
import { deleteGroup, updateGroup } from "@/lib/queries/groups";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin } from "@/lib/current-viewer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可編輯使用者群組" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  await updateGroup(CURRENT_ORG_ID, Number(id), { name, description });
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
    return NextResponse.json({ error: "僅限管理員權限帳號可刪除使用者群組" }, { status: 403 });
  }

  await deleteGroup(CURRENT_ORG_ID, Number(id));
  return NextResponse.json({ ok: true });
}
