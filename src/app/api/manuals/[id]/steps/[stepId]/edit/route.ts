import { NextResponse } from "next/server";
import { updateManualStep } from "@/lib/queries/manuals";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";
import type { ManualStepAnnotation, ManualStepEditData } from "@/types/models";

const VALID_ROTATIONS = [0, 90, 180, 270];
const VALID_ANNOTATION_TYPES = ["text", "arrow", "rect", "blur"];

function parseEditData(body: unknown): ManualStepEditData | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const editData: ManualStepEditData = {};

  if (typeof b.rotation === "number" && VALID_ROTATIONS.includes(b.rotation)) {
    editData.rotation = b.rotation as 0 | 90 | 180 | 270;
  }

  if (Array.isArray(b.trimRanges)) {
    editData.trimRanges = b.trimRanges
      .filter(
        (r): r is { start: number; end: number } =>
          typeof r === "object" &&
          r !== null &&
          typeof (r as Record<string, unknown>).start === "number" &&
          typeof (r as Record<string, unknown>).end === "number" &&
          (r as { start: number }).start >= 0 &&
          (r as { start: number; end: number }).end > (r as { start: number }).start
      )
      .map((r) => ({ start: r.start, end: r.end }));
  }

  if (Array.isArray(b.freezeFrames)) {
    editData.freezeFrames = b.freezeFrames
      .filter(
        (f): f is { time: number; duration: number } =>
          typeof f === "object" &&
          f !== null &&
          typeof (f as Record<string, unknown>).time === "number" &&
          typeof (f as Record<string, unknown>).duration === "number" &&
          (f as { time: number }).time >= 0 &&
          (f as { duration: number }).duration > 0
      )
      .map((f) => ({ time: f.time, duration: f.duration }));
  }

  if (Array.isArray(b.annotations)) {
    editData.annotations = b.annotations
      .filter((a): a is ManualStepAnnotation => {
        if (typeof a !== "object" || a === null) return false;
        const rec = a as Record<string, unknown>;
        return (
          typeof rec.id === "string" &&
          typeof rec.type === "string" &&
          VALID_ANNOTATION_TYPES.includes(rec.type) &&
          typeof rec.startTime === "number" &&
          typeof rec.endTime === "number" &&
          rec.endTime > rec.startTime &&
          typeof rec.x === "number" &&
          typeof rec.y === "number" &&
          typeof rec.width === "number" &&
          typeof rec.height === "number"
        );
      })
      .map((a) => ({
        id: a.id,
        type: a.type,
        startTime: a.startTime,
        endTime: a.endTime,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        ...(typeof a.text === "string" ? { text: a.text } : {}),
        ...(typeof a.color === "string" ? { color: a.color } : {}),
      }));
  }

  return editData;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  if (!/^\d+$/.test(stepId)) {
    return NextResponse.json({ error: "invalid stepId" }, { status: 400 });
  }

  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可編輯影片" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const editData = parseEditData(body);
  if (!editData) {
    return NextResponse.json({ error: "invalid edit data" }, { status: 400 });
  }

  await updateManualStep(Number(stepId), { editData });
  return NextResponse.json({ ok: true });
}
