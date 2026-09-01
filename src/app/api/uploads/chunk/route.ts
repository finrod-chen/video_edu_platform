import { NextResponse } from "next/server";
import { isValidUploadId, writeChunk } from "@/lib/uploads";
import { getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

// Mirrors the client's 8MB CHUNK_SIZE / 2GB MAX_UPLOAD_BYTES
// (src/lib/upload-client.ts) -- a server-side floor so a misbehaving
// client can't stream an unbounded number of chunks to disk.
const MAX_CHUNK_INDEX = 300;

export async function POST(request: Request) {
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可上傳影片" }, { status: 403 });
  }

  const formData = await request.formData();
  const uploadId = formData.get("uploadId");
  const index = formData.get("index");
  const chunk = formData.get("chunk");

  if (typeof uploadId !== "string" || !isValidUploadId(uploadId)) {
    return NextResponse.json({ error: "invalid uploadId" }, { status: 400 });
  }
  if (typeof index !== "string" || !/^\d+$/.test(index) || Number(index) > MAX_CHUNK_INDEX) {
    return NextResponse.json({ error: "invalid index" }, { status: 400 });
  }
  if (!(chunk instanceof Blob)) {
    return NextResponse.json({ error: "missing chunk" }, { status: 400 });
  }

  const buffer = Buffer.from(await chunk.arrayBuffer());
  await writeChunk(uploadId, Number(index), buffer);

  return NextResponse.json({ ok: true });
}
