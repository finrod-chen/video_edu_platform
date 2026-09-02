import { NextResponse } from "next/server";
import { recordManualView } from "@/lib/queries/reports";
import { CURRENT_ORG_ID, getCurrentUser } from "@/lib/current-viewer";

// Sanity clamp on a single ping's watched-seconds, matched to the client's
// ~30s flush interval -- not a security boundary, just guards the report
// against a stray huge number from a buggy client tick.
const MAX_WATCH_SECONDS_PER_PING = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const { id: userId } = await getCurrentUser();
  const body = await request.json().catch(() => null);
  const rawSeconds = body?.watchedSeconds;
  const watchedSeconds =
    typeof rawSeconds === "number" && Number.isFinite(rawSeconds) && rawSeconds > 0
      ? Math.min(rawSeconds, MAX_WATCH_SECONDS_PER_PING)
      : 0;

  await recordManualView(CURRENT_ORG_ID, Number(id), userId, Math.round(watchedSeconds));
  return NextResponse.json({ ok: true });
}
