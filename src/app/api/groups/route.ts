import { NextResponse } from "next/server";
import { createGroup } from "@/lib/queries/groups";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin } from "@/lib/current-viewer";

export async function POST(request: Request) {
  const { role } = await getCurrentUser();
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "僅限管理員權限帳號可建立使用者群組" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = await createGroup(CURRENT_ORG_ID, name, description);
  return NextResponse.json({ id: String(id), name, description }, { status: 201 });
}
