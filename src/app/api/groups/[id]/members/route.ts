import { NextResponse } from "next/server";
import { setGroupMembers } from "@/lib/queries/groups";
import { getCurrentUser, isAdmin } from "@/lib/current-viewer";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { role } = await getCurrentUser();
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可管理群組成員" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const userIds = Array.isArray(body?.userIds)
    ? body.userIds.filter((v: unknown): v is number => typeof v === "number")
    : null;
  if (!userIds) {
    return NextResponse.json({ error: "userIds must be an array" }, { status: 400 });
  }

  await setGroupMembers(Number(id), userIds);
  return NextResponse.json({ ok: true });
}
