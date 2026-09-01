import { NextResponse } from "next/server";
import { countAdmins, getUser, setUserRole } from "@/lib/queries/users";
import { CURRENT_ORG_ID, ROLE_ADMIN, ROLE_EDITOR, ROLE_EMPLOYEE, getCurrentUser, isAdmin } from "@/lib/current-viewer";

const VALID_ROLES = [ROLE_ADMIN, ROLE_EDITOR, ROLE_EMPLOYEE];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { role: currentRole } = await getCurrentUser();
  if (!isAdmin(currentRole)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可變更使用者角色" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }

  const targetUserId = Number(id);
  const target = await getUser(targetUserId);
  if (!target) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (target.role === ROLE_ADMIN && role !== ROLE_ADMIN) {
    const adminCount = await countAdmins(CURRENT_ORG_ID);
    if (adminCount <= 1) {
      return NextResponse.json({ error: "系統至少需要保留一位管理員" }, { status: 409 });
    }
  }

  await setUserRole(CURRENT_ORG_ID, targetUserId, role);
  return NextResponse.json({ ok: true });
}
