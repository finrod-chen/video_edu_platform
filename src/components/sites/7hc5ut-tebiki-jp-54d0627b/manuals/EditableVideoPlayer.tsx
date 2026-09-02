"use client";

import { useEffect, useRef, useState } from "react";
import type { ManualStepAnnotation, ManualStepEditData } from "@/types/tebiki";

const FREEZE_WINDOW_SECONDS = 0.3;

/** Finds the next in-range time to jump to, or a sentinel meaning "past everything". */
function nextTrimTarget(
  currentTime: number,
  ranges: { start: number; end: number }[]
): number | "in-range" | "ended" {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (const r of sorted) {
    if (currentTime < r.start) return r.start;
    if (currentTime >= r.start && currentTime < r.end) return "in-range";
  }
  return "ended";
}

function AnnotationBox({ a }: { a: ManualStepAnnotation }) {
  const boxStyle: React.CSSProperties = {
    position: "absolute",
    left: `${a.x}%`,
    top: `${a.y}%`,
    width: `${a.width}%`,
    height: `${a.height}%`,
  };

  if (a.type === "text") {
    return (
      <div
        style={boxStyle}
        className="flex items-center justify-center rounded bg-black/70 px-2 py-1 text-sm font-medium text-white"
      >
        {a.text}
      </div>
    );
  }
  if (a.type === "rect") {
    return (
      <div
        style={{ ...boxStyle, borderColor: a.color ?? "#ef4444" }}
        className="rounded border-4"
      />
    );
  }
  if (a.type === "blur") {
    return <div style={{ ...boxStyle, backdropFilter: "blur(12px)" }} className="rounded" />;
  }
  // arrow: draw a line from top-left to bottom-right of the box via SVG
  return (
    <svg style={boxStyle} className="overflow-visible">
      <defs>
        <marker id={`arrowhead-${a.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={a.color ?? "#ef4444"} />
        </marker>
      </defs>
      <line
        x1="0"
        y1="0"
        x2="100%"
        y2="100%"
        stroke={a.color ?? "#ef4444"}
        strokeWidth={3}
        markerEnd={`url(#arrowhead-${a.id})`}
      />
    </svg>
  );
}

export function EditableVideoPlayer({
  src,
  poster,
  captionSrc,
  editData,
  videoRef: externalVideoRef,
  containerRef: externalContainerRef,
  onTimeUpdate,
  onEnded,
  className,
}: {
  src: string;
  poster?: string;
  captionSrc?: string;
  editData: ManualStepEditData | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  className?: string;
}) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef ?? internalContainerRef;

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const frozenAtRef = useRef<number | null>(null);

  const rotation = editData?.rotation ?? 0;
  const trimRanges = editData?.trimRanges ?? [];
  const freezeFrames = editData?.freezeFrames ?? [];
  const annotations = editData?.annotations ?? [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    setCurrentTime(t);
    onTimeUpdate?.(t);

    if (trimRanges.length > 0) {
      const target = nextTrimTarget(t, trimRanges);
      if (target === "ended") {
        video.pause();
        onEnded?.();
        return;
      }
      if (typeof target === "number") {
        video.currentTime = target;
        return;
      }
    }

    const freeze = freezeFrames.find((f) => t >= f.time && t < f.time + FREEZE_WINDOW_SECONDS);
    if (freeze) {
      if (frozenAtRef.current !== freeze.time) {
        frozenAtRef.current = freeze.time;
        video.pause();
        setTimeout(() => {
          video.play().catch(() => {});
        }, freeze.duration * 1000);
      }
    } else {
      frozenAtRef.current = null;
    }
  }

  const isSideways = rotation === 90 || rotation === 270;
  const videoStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    ...(isSideways
      ? { width: containerSize.height || "100%", height: containerSize.width || "100%" }
      : { width: containerSize.width || "100%", height: containerSize.height || "100%" }),
  };

  const activeAnnotations = annotations.filter(
    (a) => currentTime >= a.startTime && currentTime <= a.endTime
  );

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className ?? ""}`}
    >
      <video
        ref={videoRef}
        controls
        src={src}
        poster={poster}
        style={videoStyle}
        onTimeUpdate={handleTimeUpdate}
      >
        {captionSrc && <track kind="captions" srcLang="zh-Hant" label="繁體中文" src={captionSrc} default />}
      </video>
      <div className="pointer-events-none absolute inset-0">
        {activeAnnotations.map((a) => (
          <AnnotationBox key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
