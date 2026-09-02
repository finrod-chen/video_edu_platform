"use client";

import { AnnotationBox } from "./AnnotationBox";
import type { ManualStepAnnotation } from "@/types/models";

/**
 * Static-image counterpart to EditableVideoPlayer -- annotations have no
 * time dimension here (startTime/endTime are ignored), they're just always
 * shown. Shares AnnotationBox with the video player so text/arrow/rect/blur
 * render identically in both.
 */
export function EditableImage({
  src,
  annotations,
  containerRef,
  className,
  interactiveAnnotations,
  selectedAnnotationId,
  onAnnotationClick,
}: {
  src: string;
  annotations: ManualStepAnnotation[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  interactiveAnnotations?: boolean;
  selectedAnnotationId?: string | null;
  onAnnotationClick?: (id: string) => void;
}) {
  return (
    <div
      ref={containerRef}
      className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
      <div className={interactiveAnnotations ? "absolute inset-0" : "pointer-events-none absolute inset-0"}>
        {annotations.map((a) => (
          <AnnotationBox
            key={a.id}
            a={a}
            interactive={interactiveAnnotations}
            selected={selectedAnnotationId === a.id}
            onSelect={() => onAnnotationClick?.(a.id)}
          />
        ))}
      </div>
    </div>
  );
}
