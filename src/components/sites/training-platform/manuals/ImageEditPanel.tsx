"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EditableImage } from "./EditableImage";
import type { ManualStepAnnotation, ManualStepAnnotationType, ManualStepEditData, ManualStep } from "@/types/models";

// Images only get the three types the user actually asked for -- blur is
// still a valid ManualStepAnnotation type (video keeps it) but this editor
// doesn't offer it as a creation option.
const ANNOTATION_LABEL: Record<Exclude<ManualStepAnnotationType, "blur">, string> = {
  text: "文字",
  arrow: "箭頭",
  rect: "方塊",
};

const LOCK_RENEW_INTERVAL_MS = 3 * 60 * 1000;

export function ImageEditPanel({
  manualId,
  step,
  onClose,
  onSaved,
}: {
  manualId: string;
  step: ManualStep;
  onClose: () => void;
  onSaved: (editData: ManualStepEditData) => void;
}) {
  const router = useRouter();
  const [annotations, setAnnotations] = useState<ManualStepAnnotation[]>(step.editData?.annotations ?? []);
  const [drawingType, setDrawingType] = useState<Exclude<ManualStepAnnotationType, "blur"> | null>(null);
  const [repositioningId, setRepositioningId] = useState<string | null>(null);
  const [draftBox, setDraftBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lockLost, setLockLost] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const liveEditData: ManualStepEditData = { annotations };
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) ?? null;

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
    if (!selectedAnnotation || selectedAnnotation.type === "blur") return;
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
        const newAnnotation: ManualStepAnnotation = {
          id: crypto.randomUUID(),
          type: drawingType,
          startTime: 0,
          endTime: 0,
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

  if (!step.imagePath) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2B2C2F]">編輯圖片 — {step.title}</h2>
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
          <EditableImage
            key={step.id}
            src={`/api/media/manuals/${manualId}/steps/${step.id}/image`}
            annotations={annotations}
            containerRef={containerRef}
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
        {drawingType && <p className="mt-1 text-xs text-[#8B93A1]">在畫面上拖曳來標記位置</p>}

        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-[#2B2C2F]">新增圖形標註</p>
          <div className="flex gap-2">
            {(Object.keys(ANNOTATION_LABEL) as Exclude<ManualStepAnnotationType, "blur">[]).map((t) => (
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
                    : "border-app-border text-[#2B2C2F] hover:bg-app-bg"
                )}
              >
                {ANNOTATION_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {selectedAnnotation && (
          <div className="mt-4 rounded-lg border border-app-border p-3">
            <p className="mb-2 text-sm font-bold text-[#2B2C2F]">
              標註設定 — {selectedAnnotation.type === "blur" ? "模糊" : ANNOTATION_LABEL[selectedAnnotation.type]}
            </p>
            <div className="mb-2 flex items-center gap-2 text-sm">
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
                className="mb-2 w-full rounded-lg border border-app-border px-2 py-1 text-sm"
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

        <div className="mt-6 flex justify-end gap-2 border-t border-app-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-app-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-app-bg"
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
