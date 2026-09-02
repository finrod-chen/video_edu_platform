import { NextResponse } from "next/server";
import { setEmailNotificationsEnabled } from "@/lib/queries/users";
import { getCurrentUserId } from "@/lib/current-viewer";

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  const body = await request.json().catch(() => null);
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "invalid enabled" }, { status: 400 });
  }
  await setEmailNotificationsEnabled(userId, body.enabled);
  return NextResponse.json({ ok: true });
}
