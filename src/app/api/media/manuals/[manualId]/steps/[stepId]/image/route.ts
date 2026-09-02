import { readFile } from "fs/promises";
import { getManualStepById } from "@/lib/queries/manuals";
import { resolveStoredPath } from "@/lib/uploads";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ manualId: string; stepId: string }> }
) {
  const { manualId, stepId } = await params;
  if (!/^\d+$/.test(manualId) || !/^\d+$/.test(stepId)) {
    return new Response("Not found", { status: 404 });
  }

  const step = await getManualStepById(Number(manualId), Number(stepId));
  if (!step || !step.imagePath) {
    return new Response("Not found", { status: 404 });
  }

  const ext = step.imagePath.split(".").pop() ?? "jpg";
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const buffer = await readFile(resolveStoredPath(step.imagePath));
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
  });
}
