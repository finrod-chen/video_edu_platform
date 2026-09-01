import { createReadStream } from "fs";
import OpenAI from "openai";
import * as OpenCC from "opencc-js";
import { getManualStepById, updateManualStep } from "@/lib/queries/manuals";
import { resolveStoredPath } from "@/lib/uploads";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  client = new OpenAI({ apiKey });
  return client;
}

// Whisper's Chinese output skews Simplified even with language='zh' set (the
// hint only affects transcription accuracy, not the output script) --
// convert to Traditional before storing since this is a Taiwanese company.
const toTraditional = OpenCC.Converter({ from: "cn", to: "tw" });

/**
 * Runs in the background, not awaited by the triggering HTTP response --
 * this app has no job queue, so a container restart mid-transcription loses
 * the job silently. Acceptable because the trigger is a manual button the
 * editor can just press again (see caption_status='failed'/'none' handling
 * in the UI).
 */
export async function transcribeStep(manualId: number, stepId: number): Promise<void> {
  try {
    const step = await getManualStepById(manualId, stepId);
    if (!step || !step.videoPath) {
      await updateManualStep(stepId, { captionStatus: "failed" });
      return;
    }

    const filePath = resolveStoredPath(step.videoPath);
    const transcription = await getClient().audio.transcriptions.create({
      file: createReadStream(filePath),
      model: "whisper-1",
      language: "zh",
      response_format: "vtt",
    });

    const vtt = toTraditional(String(transcription));
    await updateManualStep(stepId, { captionsVtt: vtt, captionStatus: "done" });
  } catch (err) {
    console.error(`[captions] transcription failed for manual ${manualId} step ${stepId}:`, err);
    await updateManualStep(stepId, { captionStatus: "failed" });
  }
}
