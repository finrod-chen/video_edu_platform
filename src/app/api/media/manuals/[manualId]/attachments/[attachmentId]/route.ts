import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { getManualAttachmentById } from "@/lib/queries/attachments";
import { resolveStoredPath } from "@/lib/uploads";
import { CURRENT_ORG_ID, getCurrentUser } from "@/lib/current-viewer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ manualId: string; attachmentId: string }> }
) {
  const { attachmentId } = await params;
  if (!/^\d+$/.test(attachmentId)) {
    return new Response("Not found", { status: 404 });
  }

  // Any logged-in org member can view -- the whole point of this route is
  // that the PDF has no publicly reachable static URL, only this auth-gated
  // stream (see plan notes: this is best-effort, not real DRM).
  await getCurrentUser();

  const attachment = await getManualAttachmentById(CURRENT_ORG_ID, Number(attachmentId));
  if (!attachment) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = resolveStoredPath(
    `manuals/${attachment.manualId}/attachments/${attachment.id}.pdf`
  );
  const { size } = await stat(filePath);
  const disposition = `inline; filename="${encodeURIComponent(attachment.fileName)}"`;

  const range = request.headers.get("range");
  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(size),
        "Content-Disposition": disposition,
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
      "Content-Type": "application/pdf",
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Disposition": disposition,
      "Accept-Ranges": "bytes",
    },
  });
}
