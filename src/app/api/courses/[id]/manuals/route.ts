import { NextResponse } from "next/server";
import {
  addManualToCourse,
  getCourseManuals,
  removeManualFromCourse,
  reorderCourseManuals,
} from "@/lib/queries/courses";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const manuals = await getCourseManuals(Number(id));
  return NextResponse.json(manuals);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.manualId !== "number") {
    return NextResponse.json({ error: "manualId is required" }, { status: 400 });
  }
  await addManualToCourse(Number(id), body.manualId);
  return NextResponse.json({ ok: true });
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
  const manualIds = Array.isArray(body?.manualIds) ? body.manualIds : null;
  if (!manualIds || !manualIds.every((v: unknown) => typeof v === "number")) {
    return NextResponse.json({ error: "manualIds must be an array of numbers" }, { status: 400 });
  }
  await reorderCourseManuals(Number(id), manualIds);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const manualId = new URL(request.url).searchParams.get("manualId");
  if (!manualId || !/^\d+$/.test(manualId)) {
    return NextResponse.json({ error: "manualId query param is required" }, { status: 400 });
  }
  await removeManualFromCourse(Number(id), Number(manualId));
  return NextResponse.json({ ok: true });
}
