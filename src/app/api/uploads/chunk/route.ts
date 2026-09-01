import { NextResponse } from "next/server";
import { isValidUploadId, writeChunk } from "@/lib/uploads";

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadId = formData.get("uploadId");
  const index = formData.get("index");
  const chunk = formData.get("chunk");

  if (typeof uploadId !== "string" || !isValidUploadId(uploadId)) {
    return NextResponse.json({ error: "invalid uploadId" }, { status: 400 });
  }
  if (typeof index !== "string" || !/^\d+$/.test(index)) {
    return NextResponse.json({ error: "invalid index" }, { status: 400 });
  }
  if (!(chunk instanceof Blob)) {
    return NextResponse.json({ error: "missing chunk" }, { status: 400 });
  }

  const buffer = Buffer.from(await chunk.arrayBuffer());
  await writeChunk(uploadId, Number(index), buffer);

  return NextResponse.json({ ok: true });
}
