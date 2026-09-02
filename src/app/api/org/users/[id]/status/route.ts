import { NextResponse } from "next/server";
import { countAdmins, getUser, setUserStatus } from "@/lib/queries/users";
import { CURRENT_ORG_ID, ROLE_ADMIN, getCurrentUser, isAdmin } from "@/lib/current-viewer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { id: currentUserId, role: currentRole } = await getCurrentUser();
  if (!isAdmin(currentRole)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可停用使用者" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status === "disabled" ? "disabled" : body?.status === "active" ? "active" : null;
  if (!status) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const targetUserId = Number(id);
  if (targetUserId === currentUserId && status === "disabled") {
    return NextResponse.json({ error: "無法停用自己的帳號" }, { status: 409 });
  }

  const target = await getUser(targetUserId);
  if (!target) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (target.role === ROLE_ADMIN && status === "disabled") {
    const adminCount = await countAdmins(CURRENT_ORG_ID);
    if (adminCount <= 1) {
      return NextResponse.json({ error: "系統至少需要保留一位管理員" }, { status: 409 });
    }
  }

  await setUserStatus(CURRENT_ORG_ID, targetUserId, status);
  return NextResponse.json({ ok: true });
}
