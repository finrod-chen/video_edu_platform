import { readFile } from "fs/promises";
import { getManualStepById } from "@/lib/queries/manuals";
import { resolveStoredPath } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ manualId: string; stepId: string }> }
) {
  const { manualId, stepId } = await params;
  if (!/^\d+$/.test(manualId) || !/^\d+$/.test(stepId)) {
    return new Response("Not found", { status: 404 });
  }

  const step = await getManualStepById(Number(manualId), Number(stepId));
  if (!step || !step.thumbnailPath) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readFile(resolveStoredPath(step.thumbnailPath));
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
  });
}
