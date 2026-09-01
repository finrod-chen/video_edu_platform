"use client";

const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB — well under Cloudflare's 100MB/request cap

export interface UploadResult {
  videoPath: string;
  thumbnailPath?: string;
}

/**
 * Captures a JPEG thumbnail (frame at ~1s, or the first frame for shorter
 * clips) and the duration from a local video File, entirely client-side —
 * no ffmpeg/server-side processing needed.
 */
export function captureVideoMeta(file: File): Promise<{ thumbnail: Blob; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas 2d context unavailable"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          const durationSeconds = Math.round(video.duration || 0);
          URL.revokeObjectURL(video.src);
          if (!blob) {
            reject(new Error("thumbnail capture failed"));
            return;
          }
          resolve({ thumbnail: blob, durationSeconds });
        },
        "image/jpeg",
        0.8
      );
    };

    video.onerror = () => reject(new Error("failed to load video for metadata capture"));
  });
}

export async function uploadManualStepVideo(
  manualId: string,
  stepId: string,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<UploadResult> {
  const uploadId = crypto.randomUUID();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let index = 0; index < totalChunks; index++) {
    const start = index * CHUNK_SIZE;
    const chunk = file.slice(start, start + CHUNK_SIZE);
    const formData = new FormData();
    formData.append("uploadId", uploadId);
    formData.append("index", String(index));
    formData.append("total", String(totalChunks));
    formData.append("chunk", chunk);

    const res = await fetch("/api/uploads/chunk", { method: "POST", body: formData });
    if (!res.ok) throw new Error(`chunk ${index} upload failed`);
    onProgress?.((index + 1) / (totalChunks + 1));
  }

  let thumbnail: Blob | null = null;
  let durationSeconds = 0;
  try {
    const meta = await captureVideoMeta(file);
    thumbnail = meta.thumbnail;
    durationSeconds = meta.durationSeconds;
  } catch {
    // Thumbnail capture is best-effort (e.g. unsupported codec in-browser);
    // the video itself still uploads fine without one.
  }

  const completeForm = new FormData();
  completeForm.append("uploadId", uploadId);
  completeForm.append("manualId", manualId);
  completeForm.append("stepId", stepId);
  completeForm.append("mimeType", file.type);
  completeForm.append("durationSeconds", String(durationSeconds));
  if (thumbnail) completeForm.append("thumbnail", thumbnail, "thumbnail.jpg");

  const completeRes = await fetch("/api/uploads/complete", { method: "POST", body: completeForm });
  if (!completeRes.ok) throw new Error("upload finalize failed");
  onProgress?.(1);

  return completeRes.json();
}
