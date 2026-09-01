"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TebikiManual, TebikiManualStep } from "@/types/tebiki";

export function ManualViewerClient({
  manual,
  steps,
}: {
  manual: TebikiManual;
  steps: TebikiManualStep[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-tebiki-border bg-white p-10 text-center text-sm text-[#8B93A1]">
        這份手冊還沒有任何步驟內容。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="overflow-hidden rounded-xl bg-black">
          {activeStep.videoPath ? (
            <video
              key={activeStep.id}
              controls
              className="aspect-video w-full"
              src={`/api/media/manuals/${manual.id}/steps/${activeStep.id}`}
              poster={
                activeStep.thumbnailPath
                  ? `/api/media/manuals/${manual.id}/steps/${activeStep.id}/thumbnail`
                  : undefined
              }
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-white/60">
              此步驟尚未上傳影片
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => i - 1)}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg disabled:opacity-30"
          >
            ‹ 上一步
          </button>
          <h2 className="text-sm font-bold text-[#2B2C2F]">
            {activeIndex + 1}. {activeStep.title}
          </h2>
          <button
            type="button"
            disabled={activeIndex === steps.length - 1}
            onClick={() => setActiveIndex((i) => i + 1)}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg disabled:opacity-30"
          >
            下一步 ›
          </button>
        </div>
      </div>

      <aside className="space-y-1">
        <p className="mb-2 text-xs font-medium text-[#8B93A1]">步驟導覽</p>
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
              index === activeIndex ? "bg-brand/10 text-brand font-medium" : "text-[#2B2C2F] hover:bg-tebiki-bg"
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tebiki-bg text-xs">
              {index + 1}
            </span>
            <span className="truncate">{step.title}</span>
          </button>
        ))}
      </aside>
    </div>
  );
}
