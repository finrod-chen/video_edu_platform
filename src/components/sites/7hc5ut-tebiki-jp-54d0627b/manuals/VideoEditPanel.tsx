"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EditableVideoPlayer } from "./EditableVideoPlayer";
import type { ManualStepAnnotation, ManualStepAnnotationType, ManualStepEditData, TebikiManualStep } from "@/types/tebiki";

const ANNOTATION_LABEL: Record<ManualStepAnnotationType, string> = {
  text: "文字",
  arrow: "箭頭",
  rect: "方塊",
  blur: "模糊",
};

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
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(step.editData?.rotation ?? 0);
  const [trimRanges, setTrimRanges] = useState(step.editData?.trimRanges ?? []);
  const [freezeFrames, setFreezeFrames] = useState(step.editData?.freezeFrames ?? []);
  const [annotations, setAnnotations] = useState<ManualStepAnnotation[]>(step.editData?.annotations ?? []);
  const [currentTime, setCurrentTime] = useState(0);
  const [drawingType, setDrawingType] = useState<ManualStepAnnotationType | null>(null);
  const [draftBox, setDraftBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const liveEditData: ManualStepEditData = { rotation, trimRanges, freezeFrames, annotations };

  function handleRotate() {
    setRotation((r) => (r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0));
  }

  function addTrimRange() {
    const t = Math.floor(currentTime);
    setTrimRanges((prev) => [...prev, { start: t, end: t + 5 }]);
  }
  function updateTrimRange(index: number, field: "start" | "end", value: number) {
    setTrimRanges((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }
  function removeTrimRange(index: number) {
    setTrimRanges((prev) => prev.filter((_, i) => i !== index));
  }

  function addFreezeFrame() {
    setFreezeFrames((prev) => [...prev, { time: Math.floor(currentTime), duration: 3 }]);
  }
  function updateFreezeFrame(index: number, field: "time" | "duration", value: number) {
    setFreezeFrames((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }
  function removeFreezeFrame(index: number) {
    setFreezeFrames((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAnnotation(index: number, patch: Partial<ManualStepAnnotation>) {
    setAnnotations((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }
  function removeAnnotation(index: number) {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
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
      const start = Math.max(0, Math.round(currentTime));
      const newAnnotation: ManualStepAnnotation = {
        id: crypto.randomUUID(),
        type: drawingType,
        startTime: start,
        endTime: start + 3,
        x: draftBox.x,
        y: draftBox.y,
        width,
        height,
        color: "#ef4444",
        ...(drawingType === "text" ? { text: "文字標註" } : {}),
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
    }
    setDrawingType(null);
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

        <div className="relative">
          <EditableVideoPlayer
            key={step.id}
            src={`/api/media/manuals/${manualId}/steps/${step.id}`}
            editData={liveEditData}
            videoRef={videoRef}
            containerRef={containerRef}
            onTimeUpdate={setCurrentTime}
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
        <p className="mt-1 text-xs text-[#8B93A1]">目前播放位置：{currentTime.toFixed(1)} 秒</p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">旋轉</p>
            <button
              type="button"
              onClick={handleRotate}
              className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg"
            >
              旋轉 90°（目前：{rotation}°）
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">剪輯段落（保留播放的時間區間，秒）</p>
            <div className="space-y-2">
              {trimRanges.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <input
                    type="number"
                    value={r.start}
                    onChange={(e) => updateTrimRange(i, "start", Number(e.target.value))}
                    className="w-20 rounded-lg border border-tebiki-border px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateTrimRange(i, "start", Math.floor(currentTime))}
                    className="text-xs text-brand hover:underline"
                  >
                    使用目前位置
                  </button>
                  <span className="text-[#8B93A1]">到</span>
                  <input
                    type="number"
                    value={r.end}
                    onChange={(e) => updateTrimRange(i, "end", Number(e.target.value))}
                    className="w-20 rounded-lg border border-tebiki-border px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateTrimRange(i, "end", Math.floor(currentTime))}
                    className="text-xs text-brand hover:underline"
                  >
                    使用目前位置
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTrimRange(i)}
                    className="ml-auto text-xs text-red-600 hover:underline"
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addTrimRange} className="mt-2 text-sm text-brand hover:underline">
              ＋ 新增段落
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">定格點</p>
            <div className="space-y-2">
              {freezeFrames.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-[#8B93A1]">在</span>
                  <input
                    type="number"
                    value={f.time}
                    onChange={(e) => updateFreezeFrame(i, "time", Number(e.target.value))}
                    className="w-20 rounded-lg border border-tebiki-border px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateFreezeFrame(i, "time", Math.floor(currentTime))}
                    className="text-xs text-brand hover:underline"
                  >
                    使用目前位置
                  </button>
                  <span className="text-[#8B93A1]">秒暫停</span>
                  <input
                    type="number"
                    value={f.duration}
                    onChange={(e) => updateFreezeFrame(i, "duration", Number(e.target.value))}
                    className="w-20 rounded-lg border border-tebiki-border px-2 py-1"
                  />
                  <span className="text-[#8B93A1]">秒</span>
                  <button
                    type="button"
                    onClick={() => removeFreezeFrame(i)}
                    className="ml-auto text-xs text-red-600 hover:underline"
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFreezeFrame} className="mt-2 text-sm text-brand hover:underline">
              ＋ 新增定格點
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">圖形標註</p>
            <div className="mb-2 flex gap-2">
              {(Object.keys(ANNOTATION_LABEL) as ManualStepAnnotationType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDrawingType(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm",
                    drawingType === t
                      ? "border-brand bg-brand text-white"
                      : "border-tebiki-border text-[#2B2C2F] hover:bg-tebiki-bg"
                  )}
                >
                  {ANNOTATION_LABEL[t]}
                </button>
              ))}
            </div>
            {drawingType && (
              <p className="mb-2 text-xs text-[#8B93A1]">在上方預覽畫面上拖曳滑鼠來標記位置與大小</p>
            )}
            <div className="space-y-2">
              {annotations.map((a, i) => (
                <div key={a.id} className="space-y-1.5 rounded-lg border border-tebiki-border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#2B2C2F]">{ANNOTATION_LABEL[a.type]}</span>
                    <input
                      type="number"
                      value={a.startTime}
                      onChange={(e) => updateAnnotation(i, { startTime: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-tebiki-border px-2 py-1"
                    />
                    <span className="text-[#8B93A1]">～</span>
                    <input
                      type="number"
                      value={a.endTime}
                      onChange={(e) => updateAnnotation(i, { endTime: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-tebiki-border px-2 py-1"
                    />
                    <span className="text-[#8B93A1]">秒</span>
                    <input
                      type="color"
                      value={a.color ?? "#ef4444"}
                      onChange={(e) => updateAnnotation(i, { color: e.target.value })}
                      className="h-7 w-10"
                    />
                    <button
                      type="button"
                      onClick={() => removeAnnotation(i)}
                      className="ml-auto text-xs text-red-600 hover:underline"
                    >
                      刪除
                    </button>
                  </div>
                  {a.type === "text" && (
                    <input
                      type="text"
                      value={a.text ?? ""}
                      onChange={(e) => updateAnnotation(i, { text: e.target.value })}
                      placeholder="標註文字"
                      className="w-full rounded-lg border border-tebiki-border px-2 py-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

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
