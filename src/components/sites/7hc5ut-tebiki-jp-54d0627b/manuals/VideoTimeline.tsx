"use client";

import { useRef } from "react";
import type { ManualStepAnnotation } from "@/types/tebiki";

interface TrimRange {
  start: number;
  end: number;
}
interface FreezeFrame {
  time: number;
  duration: number;
}

function timeFromClientX(clientX: number, el: HTMLElement, duration: number): number {
  const rect = el.getBoundingClientRect();
  const ratio = rect.width > 0 ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) : 0;
  return ratio * duration;
}

function pct(time: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.min(100, Math.max(0, (time / duration) * 100));
}

/** Is this moment inside at least one kept trim range (or is trimming off entirely)? */
function isKept(time: number, trimRanges: TrimRange[]): boolean {
  if (trimRanges.length === 0) return true;
  return trimRanges.some((r) => time >= r.start && time < r.end);
}

type DragState =
  | { kind: "trim-start"; index: number }
  | { kind: "trim-end"; index: number }
  | { kind: "freeze"; index: number }
  | { kind: "annotation-move"; index: number; grabOffsetTime: number }
  | { kind: "annotation-start"; index: number }
  | { kind: "annotation-end"; index: number };

export function VideoTimeline({
  duration,
  currentTime,
  onSeek,
  trimRanges,
  onTrimRangesChange,
  freezeFrames,
  onFreezeFramesChange,
  selectedFreezeIndex,
  onSelectFreeze,
  annotations,
  onAnnotationsChange,
  selectedAnnotationId,
  onSelectAnnotation,
}: {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  trimRanges: TrimRange[];
  onTrimRangesChange: (ranges: TrimRange[]) => void;
  freezeFrames: FreezeFrame[];
  onFreezeFramesChange: (frames: FreezeFrame[]) => void;
  selectedFreezeIndex: number | null;
  onSelectFreeze: (index: number | null) => void;
  annotations: ManualStepAnnotation[];
  onAnnotationsChange: (annotations: ManualStepAnnotation[]) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const trimTrackRef = useRef<HTMLDivElement>(null);
  const freezeTrackRef = useRef<HTMLDivElement>(null);
  const annotationTrackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  function startDrag(state: DragState, trackEl: HTMLElement | null) {
    if (!trackEl || duration <= 0) return;
    dragRef.current = state;

    function handleMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || !trackEl) return;
      const t = timeFromClientX(e.clientX, trackEl, duration);

      if (drag.kind === "trim-start" || drag.kind === "trim-end") {
        const ranges = [...trimRanges];
        const r = ranges[drag.index];
        if (!r) return;
        const prevEnd = ranges[drag.index - 1]?.end ?? 0;
        const nextStart = ranges[drag.index + 1]?.start ?? duration;
        if (drag.kind === "trim-start") {
          r.start = Math.min(Math.max(t, prevEnd), r.end - 0.1);
        } else {
          r.end = Math.max(Math.min(t, nextStart), r.start + 0.1);
        }
        onTrimRangesChange(ranges);
      } else if (drag.kind === "freeze") {
        const frames = [...freezeFrames];
        const f = frames[drag.index];
        if (!f) return;
        f.time = Math.max(0, Math.min(t, duration));
        onFreezeFramesChange(frames);
      } else {
        const items = [...annotations];
        const a = items[drag.index];
        if (!a) return;
        if (drag.kind === "annotation-start") {
          a.startTime = Math.min(Math.max(0, t), a.endTime - 0.1);
        } else if (drag.kind === "annotation-end") {
          a.endTime = Math.max(Math.min(duration, t), a.startTime + 0.1);
        } else {
          const span = a.endTime - a.startTime;
          const offset = drag.grabOffsetTime ?? 0;
          let newStart = t - offset;
          newStart = Math.max(0, Math.min(newStart, duration - span));
          a.startTime = newStart;
          a.endTime = newStart + span;
        }
        onAnnotationsChange(items);
      }
    }

    function handleUp() {
      dragRef.current = null;
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    }

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
  }

  function addTrimRange() {
    const start = currentTime;
    const end = Math.min(duration, start + 5);
    const next = [...trimRanges, { start, end }].sort((a, b) => a.start - b.start);
    onTrimRangesChange(next);
  }
  function removeTrimRange(index: number) {
    onTrimRangesChange(trimRanges.filter((_, i) => i !== index));
  }

  function addFreezeFrame() {
    onFreezeFramesChange([...freezeFrames, { time: currentTime, duration: 3 }]);
    onSelectFreeze(freezeFrames.length);
  }

  if (duration <= 0) {
    return (
      <div className="rounded-xl border border-tebiki-border bg-white p-6 text-center text-sm text-[#8B93A1]">
        載入中…
      </div>
    );
  }

  return (
    <div className="select-none rounded-xl border border-tebiki-border bg-white p-4">
      {/* Ruler + playhead */}
      <div
        ref={rulerRef}
        className="relative h-6 cursor-pointer rounded bg-tebiki-bg"
        onClick={(e) => onSeek(timeFromClientX(e.clientX, rulerRef.current!, duration))}
      >
        <div
          className="pointer-events-none absolute top-0 h-full w-0.5 bg-red-500"
          style={{ left: `${pct(currentTime, duration)}%` }}
        />
      </div>

      {/* Trim track */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-medium text-[#8B93A1]">剪輯段落（保留播放的區間）</p>
        <button type="button" onClick={addTrimRange} className="text-xs text-brand hover:underline">
          ＋新增段落
        </button>
      </div>
      <div ref={trimTrackRef} className="relative mt-1 h-8 rounded bg-[#E5E1DA]">
        {trimRanges.length === 0 ? (
          <div className="absolute inset-0 rounded bg-brand/40" />
        ) : (
          trimRanges.map((r, i) => {
            const deadFreezes = freezeFrames.some((f) => !isKept(f.time, trimRanges) && f.time >= r.start && f.time < r.end);
            return (
              <div
                key={i}
                className="group absolute top-0 h-full rounded bg-brand/40"
                style={{ left: `${pct(r.start, duration)}%`, width: `${pct(r.end - r.start, duration)}%` }}
              >
                <div
                  className="absolute -left-1 top-0 h-full w-2 cursor-ew-resize rounded-l bg-brand"
                  onPointerDown={() => startDrag({ kind: "trim-start", index: i }, trimTrackRef.current)}
                />
                <div
                  className="absolute -right-1 top-0 h-full w-2 cursor-ew-resize rounded-r bg-brand"
                  onPointerDown={() => startDrag({ kind: "trim-end", index: i }, trimTrackRef.current)}
                />
                <button
                  type="button"
                  onClick={() => removeTrimRange(i)}
                  className="absolute right-0.5 top-0.5 hidden text-[10px] text-white group-hover:block"
                  aria-label="刪除段落"
                >
                  ×
                </button>
                {deadFreezes && (
                  <span className="absolute -top-4 left-0 text-[10px] text-amber-600">內含已剪掉的定格點</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Freeze track */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-medium text-[#8B93A1]">定格點</p>
        <button type="button" onClick={addFreezeFrame} className="text-xs text-brand hover:underline">
          ＋新增定格點
        </button>
      </div>
      <div ref={freezeTrackRef} className="relative mt-1 h-4 rounded bg-[#E5E1DA]">
        {freezeFrames.map((f, i) => {
          const dead = !isKept(f.time, trimRanges);
          return (
            <button
              key={i}
              type="button"
              onPointerDown={() => startDrag({ kind: "freeze", index: i }, freezeTrackRef.current)}
              onClick={() => onSelectFreeze(i)}
              className={`absolute top-0 h-full w-2 -translate-x-1/2 cursor-ew-resize rounded-sm ${
                selectedFreezeIndex === i ? "bg-red-600" : dead ? "bg-amber-400/50" : "bg-amber-500"
              }`}
              style={{ left: `${pct(f.time, duration)}%` }}
              aria-label="定格點"
            />
          );
        })}
      </div>

      {/* Annotation track */}
      <div className="mt-3">
        <p className="text-xs font-medium text-[#8B93A1]">圖形標註（時間範圍，點選預覽畫面上的標註來選取）</p>
      </div>
      <div ref={annotationTrackRef} className="relative mt-1 h-4 rounded bg-[#E5E1DA]">
        {annotations.map((a, i) => {
          const dead = !isKept(a.startTime, trimRanges) && !isKept(a.endTime, trimRanges);
          return (
            <div
              key={a.id}
              className="absolute top-0 h-full cursor-grab rounded-sm"
              style={{
                left: `${pct(a.startTime, duration)}%`,
                width: `${pct(a.endTime - a.startTime, duration)}%`,
                backgroundColor: a.color ?? "#ef4444",
                opacity: selectedAnnotationId === a.id ? 1 : dead ? 0.3 : 0.6,
                outline: selectedAnnotationId === a.id ? "2px solid #2B2C2F" : undefined,
              }}
              onClick={() => onSelectAnnotation(a.id)}
              onPointerDown={(e) => {
                const el = annotationTrackRef.current;
                if (!el) return;
                const grabTime = timeFromClientX(e.clientX, el, duration);
                startDrag(
                  { kind: "annotation-move", index: i, grabOffsetTime: grabTime - a.startTime },
                  el
                );
              }}
            >
              <div
                className="absolute -left-1 top-0 h-full w-1.5 cursor-ew-resize"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag({ kind: "annotation-start", index: i }, annotationTrackRef.current);
                }}
              />
              <div
                className="absolute -right-1 top-0 h-full w-1.5 cursor-ew-resize"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag({ kind: "annotation-end", index: i }, annotationTrackRef.current);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
