"use client";

import { useEffect, useRef, useState } from "react";
import { uploadManualStepVideo } from "@/lib/upload-client";
import type { CaptionStatus, TebikiManualStep } from "@/types/tebiki";
import {
  ChevronDownIcon,
  PlusIcon,
} from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";

const CAPTION_STATUS_LABEL: Record<CaptionStatus, string> = {
  none: "",
  pending: "字幕產生中…",
  done: "字幕已就緒",
  failed: "字幕產生失敗，可重試",
};

export function StepCard({
  manualId,
  step,
  index,
  total,
  onTitleChange,
  onDelete,
  onMove,
  onUploaded,
}: {
  manualId: string;
  step: TebikiManualStep;
  index: number;
  total: number;
  onTitleChange: (stepId: string, title: string) => void;
  onDelete: (stepId: string) => void;
  onMove: (stepId: string, direction: "up" | "down") => void;
  onUploaded: (stepId: string, videoPath: string, thumbnailPath?: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captionStatus, setCaptionStatus] = useState<CaptionStatus>(step.captionStatus);

  useEffect(() => {
    setCaptionStatus(step.captionStatus);
  }, [step.captionStatus]);

  useEffect(() => {
    if (captionStatus !== "pending") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/manuals/${manualId}/steps/${step.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.captionStatus !== "pending") {
        setCaptionStatus(data.captionStatus);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [captionStatus, manualId, step.id]);

  async function handleGenerateCaptions() {
    setCaptionStatus("pending");
    await fetch(`/api/manuals/${manualId}/steps/${step.id}/captions`, { method: "POST" });
  }

  async function handleFileSelected(file: File) {
    if (!file.type.startsWith("video/")) {
      setError("請選擇影片檔案");
      return;
    }
    setError(null);
    setProgress(0);
    try {
      const result = await uploadManualStepVideo(manualId, step.id, file, setProgress);
      onUploaded(step.id, result.videoPath, result.thumbnailPath);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "上傳失敗，請再試一次。");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex gap-4 rounded-xl border border-tebiki-border bg-white p-4">
      <div className="flex flex-col items-center gap-1 pt-1 text-[#8B93A1]">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(step.id, "up")}
          className="rotate-180 disabled:opacity-30"
          aria-label="上移"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-[#2B2C2F]">{index + 1}</span>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(step.id, "down")}
          className="disabled:opacity-30"
          aria-label="下移"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-tebiki-bg"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFileSelected(file);
        }}
      >
        {step.thumbnailPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/media/manuals/${manualId}/steps/${step.id}/thumbnail`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : progress !== null ? (
          <span className="text-xs text-[#8B93A1]">上傳中 {Math.round(progress * 100)}%</span>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-xs text-[#8B93A1] hover:text-brand"
          >
            <PlusIcon className="h-5 w-5" />
            上傳影片
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileSelected(file);
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <input
          defaultValue={step.title}
          onBlur={(e) => onTitleChange(step.id, e.target.value)}
          placeholder="步驟標題"
          className="w-full rounded-lg border border-tebiki-border px-3 py-2 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        {step.videoPath && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-brand hover:underline"
            >
              重新上傳影片
            </button>
            {captionStatus === "none" || captionStatus === "failed" ? (
              <button
                type="button"
                onClick={handleGenerateCaptions}
                className="text-xs text-brand hover:underline"
              >
                產生字幕
              </button>
            ) : (
              <span className="text-xs text-[#8B93A1]">{CAPTION_STATUS_LABEL[captionStatus]}</span>
            )}
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm(`確定要刪除步驟「${step.title || `步驟 ${index + 1}`}」嗎？影片也會一併刪除，此動作無法復原。`)) {
            onDelete(step.id);
          }
        }}
        className="self-start text-xs text-[#8B93A1] hover:text-red-600"
        aria-label="刪除步驟"
      >
        刪除
      </button>
    </div>
  );
}
