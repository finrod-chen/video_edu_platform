"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EditableVideoPlayer } from "./EditableVideoPlayer";
import { VideoTimeline } from "./VideoTimeline";
import type { ManualStepAnnotation, ManualStepAnnotationType, ManualStepEditData, TebikiManualStep } from "@/types/tebiki";

const ANNOTATION_LABEL: Record<ManualStepAnnotationType, string> = {
  text: "文字",
  arrow: "箭頭",
  rect: "方塊",
  blur: "模糊",
};

const LOCK_RENEW_INTERVAL_MS = 3 * 60 * 1000;

export function VideoEditPanel({
  manualId,
  step,
  onClose,
  onSaved,
}: {
  manualId: string;
  step: TebikiManualStep;
  onClose: () => void;
  onSaved: (editData: ManualStepEditData) => void;
}) {
  const router = useRouter();
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(step.editData?.rotation ?? 0);
  const [trimRanges, setTrimRanges] = useState(step.editData?.trimRanges ?? []);
  const [freezeFrames, setFreezeFrames] = useState(step.editData?.freezeFrames ?? []);
  const [annotations, setAnnotations] = useState<ManualStepAnnotation[]>(step.editData?.annotations ?? []);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(step.durationSeconds ?? 0);
  const [drawingType, setDrawingType] = useState<ManualStepAnnotationType | null>(null);
  const [repositioningId, setRepositioningId] = useState<string | null>(null);
  const [draftBox, setDraftBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [selectedFreezeIndex, setSelectedFreezeIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [lockLost, setLockLost] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const liveEditData: ManualStepEditData = { rotation, trimRanges, freezeFrames, annotations };
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) ?? null;

  // Keep the lock alive while the panel is open; if renewal ever fails, someone
  // else has taken over -- stop editing rather than risk clobbering their save.
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/manuals/${manualId}/steps/${step.id}/edit-lock`, { method: "POST" });
      if (!res.ok) setLockLost(true);
    }, LOCK_RENEW_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [manualId, step.id]);

  useEffect(() => {
    return () => {
      void fetch(`/api/manuals/${manualId}/steps/${step.id}/edit-lock`, { method: "DELETE" });
    };
  }, [manualId, step.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    function updateDuration() {
      if (video && video.duration && Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }
    }
    video.addEventListener("loadedmetadata", updateDuration);
    updateDuration();
    return () => video.removeEventListener("loadedmetadata", updateDuration);
  }, []);

  function handleRotate() {
    setRotation((r) => (r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0));
  }

  function updateFreezeFrame(index: number, field: "time" | "duration", value: number) {
    setFreezeFrames((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }
  function removeFreezeFrame(index: number) {
    setFreezeFrames((prev) => prev.filter((_, i) => i !== index));
    setSelectedFreezeIndex(null);
  }

  function updateSelectedAnnotation(patch: Partial<ManualStepAnnotation>) {
    if (!selectedAnnotationId) return;
    setAnnotations((prev) => prev.map((a) => (a.id === selectedAnnotationId ? { ...a, ...patch } : a)));
  }
  function removeSelectedAnnotation() {
    if (!selectedAnnotationId) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedAnnotationId));
    setSelectedAnnotationId(null);
  }

  function beginReposition() {
    if (!selectedAnnotation) return;
    setRepositioningId(selectedAnnotation.id);
    setDrawingType(selectedAnnotation.type);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!drawingType || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    dragStartRef.current = { x, y };
    setDraftBox({ x, y, w: 0, h: 0 });
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const start = dragStartRef.current;
    setDraftBox({
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      w: Math.abs(x - start.x),
      h: Math.abs(y - start.y),
    });
  }
  function handlePointerUp() {
    if (draftBox && drawingType) {
      const width = Math.max(draftBox.w, 3);
      const height = Math.max(draftBox.h, 3);

      if (repositioningId) {
        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === repositioningId ? { ...a, x: draftBox.x, y: draftBox.y, width, height } : a
          )
        );
      } else {
        const start = Math.max(0, Math.round(currentTime));
        const newAnnotation: ManualStepAnnotation = {
          id: crypto.randomUUID(),
          type: drawingType,
          startTime: start,
          endTime: Math.min(duration || start + 3, start + 3),
          x: draftBox.x,
          y: draftBox.y,
          width,
          height,
          color: "#ef4444",
          ...(drawingType === "text" ? { text: "文字標註" } : {}),
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        setSelectedAnnotationId(newAnnotation.id);
      }
    }
    setDrawingType(null);
    setRepositioningId(null);
    setDraftBox(null);
    dragStartRef.current = null;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/manuals/${manualId}/steps/${step.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liveEditData),
      });
      if (res.ok) {
        onSaved(liveEditData);
        router.refresh();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!step.videoPath) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2B2C2F]">編輯影片 — {step.title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-[#8B93A1] hover:text-[#2B2C2F]">
            關閉
          </button>
        </div>

        {lockLost && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            編輯鎖已失效（可能逾時或被其他人接手），請關閉後重新進入編輯。
          </div>
        )}

        <div className="relative">
          <EditableVideoPlayer
            key={step.id}
            src={`/api/media/manuals/${manualId}/steps/${step.id}`}
            editData={liveEditData}
            videoRef={videoRef}
            containerRef={containerRef}
            onTimeUpdate={setCurrentTime}
            interactiveAnnotations={!drawingType}
            selectedAnnotationId={selectedAnnotationId}
            onAnnotationClick={setSelectedAnnotationId}
          />
          {drawingType && (
            <div
              className="absolute inset-0 cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {draftBox && (
                <div
                  className="absolute border-2 border-dashed border-brand bg-brand/10"
                  style={{
                    left: `${draftBox.x}%`,
                    top: `${draftBox.y}%`,
                    width: `${draftBox.w}%`,
                    height: `${draftBox.h}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-[#8B93A1]">
          目前播放位置：{currentTime.toFixed(1)} 秒
          {drawingType && "　— 在畫面上拖曳來標記位置"}
        </p>

        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-[#2B2C2F]">旋轉</p>
          <button
            type="button"
            onClick={handleRotate}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg"
          >
            旋轉 90°（目前：{rotation}°）
          </button>
        </div>

        <div className="mt-4">
          <VideoTimeline
            duration={duration}
            currentTime={currentTime}
            onSeek={(t) => {
              if (videoRef.current) videoRef.current.currentTime = t;
            }}
            trimRanges={trimRanges}
            onTrimRangesChange={setTrimRanges}
            freezeFrames={freezeFrames}
            onFreezeFramesChange={setFreezeFrames}
            selectedFreezeIndex={selectedFreezeIndex}
            onSelectFreeze={setSelectedFreezeIndex}
            annotations={annotations}
            onAnnotationsChange={setAnnotations}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-[#2B2C2F]">新增圖形標註</p>
          <div className="flex gap-2">
            {(Object.keys(ANNOTATION_LABEL) as ManualStepAnnotationType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSelectedAnnotationId(null);
                  setRepositioningId(null);
                  setDrawingType(t);
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  drawingType === t && !repositioningId
                    ? "border-brand bg-brand text-white"
                    : "border-tebiki-border text-[#2B2C2F] hover:bg-tebiki-bg"
                )}
              >
                {ANNOTATION_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {selectedFreezeIndex !== null && freezeFrames[selectedFreezeIndex] && (
          <div className="mt-4 rounded-lg border border-tebiki-border p-3">
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">定格點設定</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8B93A1]">在 {freezeFrames[selectedFreezeIndex].time.toFixed(1)} 秒暫停</span>
              <input
                type="number"
                min={1}
                value={freezeFrames[selectedFreezeIndex].duration}
                onChange={(e) => updateFreezeFrame(selectedFreezeIndex, "duration", Number(e.target.value))}
                className="w-20 rounded-lg border border-tebiki-border px-2 py-1"
              />
              <span className="text-[#8B93A1]">秒</span>
              <button
                type="button"
                onClick={() => removeFreezeFrame(selectedFreezeIndex)}
                className="ml-auto text-xs text-red-600 hover:underline"
              >
                刪除
              </button>
            </div>
          </div>
        )}

        {selectedAnnotation && (
          <div className="mt-4 rounded-lg border border-tebiki-border p-3">
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">標註設定 — {ANNOTATION_LABEL[selectedAnnotation.type]}</p>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <input
                type="number"
                value={selectedAnnotation.startTime}
                onChange={(e) => updateSelectedAnnotation({ startTime: Number(e.target.value) })}
                className="w-16 rounded-lg border border-tebiki-border px-2 py-1"
              />
              <span className="text-[#8B93A1]">～</span>
              <input
                type="number"
                value={selectedAnnotation.endTime}
                onChange={(e) => updateSelectedAnnotation({ endTime: Number(e.target.value) })}
                className="w-16 rounded-lg border border-tebiki-border px-2 py-1"
              />
              <span className="text-[#8B93A1]">秒</span>
              <input
                type="color"
                value={selectedAnnotation.color ?? "#ef4444"}
                onChange={(e) => updateSelectedAnnotation({ color: e.target.value })}
                className="h-7 w-10"
              />
            </div>
            {selectedAnnotation.type === "text" && (
              <input
                type="text"
                value={selectedAnnotation.text ?? ""}
                onChange={(e) => updateSelectedAnnotation({ text: e.target.value })}
                placeholder="標註文字"
                className="mb-2 w-full rounded-lg border border-tebiki-border px-2 py-1 text-sm"
              />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={beginReposition} className="text-xs text-brand hover:underline">
                重新標記位置
              </button>
              <button
                type="button"
                onClick={removeSelectedAnnotation}
                className="text-xs text-red-600 hover:underline"
              >
                刪除
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-tebiki-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg"
          >
            取消
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}
