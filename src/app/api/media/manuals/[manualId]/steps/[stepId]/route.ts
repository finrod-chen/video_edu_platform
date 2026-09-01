import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { getManualStepById } from "@/lib/queries/manuals";
import { resolveStoredPath } from "@/lib/uploads";

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ manualId: string; stepId: string }> }
) {
  const { manualId, stepId } = await params;
  if (!/^\d+$/.test(manualId) || !/^\d+$/.test(stepId)) {
    return new Response("Not found", { status: 404 });
  }

  const step = await getManualStepById(Number(manualId), Number(stepId));
  if (!step || !step.videoPath) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = resolveStoredPath(step.videoPath);
  const { size } = await stat(filePath);
  const ext = step.videoPath.split(".").pop() ?? "mp4";
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

  const range = request.headers.get("range");
  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    return new Response("Invalid Range", { status: 416 });
  }
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (start >= size || end >= size || start > end) {
    return new Response("Invalid Range", {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
  return new Response(stream, {
    status: 206,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
    },
  });
}
