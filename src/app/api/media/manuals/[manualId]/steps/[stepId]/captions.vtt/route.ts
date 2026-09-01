import { getManualStepById } from "@/lib/queries/manuals";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ manualId: string; stepId: string }> }
) {
  const { manualId, stepId } = await params;
  if (!/^\d+$/.test(manualId) || !/^\d+$/.test(stepId)) {
    return new Response("Not found", { status: 404 });
  }

  const step = await getManualStepById(Number(manualId), Number(stepId));
  if (!step || !step.captionsVtt) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(step.captionsVtt, {
    headers: { "Content-Type": "text/vtt; charset=utf-8", "Cache-Control": "private, max-age=3600" },
  });
}
