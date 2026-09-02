"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TebikiManual, TebikiManualStep, TebikiQuiz, TebikiQuizAttempt } from "@/types/tebiki";

export function ManualViewerClient({
  manual,
  steps,
  initialAcknowledgedStepIds,
  quiz,
  quizUnlocked: initialQuizUnlocked,
  latestAttempt,
}: {
  manual: TebikiManual;
  steps: TebikiManualStep[];
  initialAcknowledgedStepIds: string[];
  quiz: TebikiQuiz | null;
  quizUnlocked: boolean;
  latestAttempt: TebikiQuizAttempt | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [acknowledgedStepIds, setAcknowledgedStepIds] = useState(new Set(initialAcknowledgedStepIds));
  const [quizUnlocked, setQuizUnlocked] = useState(initialQuizUnlocked);
  const [acknowledging, setAcknowledging] = useState(false);
  const activeStep = steps[activeIndex];

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-tebiki-border bg-white p-10 text-center text-sm text-[#8B93A1]">
        這份手冊還沒有任何步驟內容。
      </div>
    );
  }

  const isLastStep = activeIndex === steps.length - 1;
  const activeStepAcknowledged = acknowledgedStepIds.has(activeStep.id);

  async function handleAcknowledgeStep() {
    setAcknowledging(true);
    try {
      const res = await fetch(`/api/manuals/${manual.id}/steps/${activeStep.id}/acknowledge`, {
        method: "POST",
      });
      if (res.ok) {
        setAcknowledgedStepIds((prev) => new Set(prev).add(activeStep.id));
        if (isLastStep) setQuizUnlocked(true);
      }
    } finally {
      setAcknowledging(false);
    }
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
            >
              {activeStep.captionStatus === "done" && (
                <track
                  kind="captions"
                  srcLang="zh-Hant"
                  label="繁體中文"
                  src={`/api/media/manuals/${manual.id}/steps/${activeStep.id}/captions.vtt`}
                  default
                />
              )}
            </video>
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-white/60">
              此步驟尚未上傳影片
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-tebiki-border bg-white p-4">
          <p className="text-sm font-bold text-[#2B2C2F]">
            {activeIndex + 1}. {activeStep.title}
          </p>
          {activeStepAcknowledged ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand/10 px-4 py-2 text-sm font-bold text-brand">
              ✓ 已瞭解
            </span>
          ) : (
            <button
              type="button"
              disabled={acknowledging}
              onClick={handleAcknowledgeStep}
              className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {acknowledging ? "送出中…" : "已瞭解本步驟"}
            </button>
          )}
        </div>

        {quiz && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-tebiki-border bg-white p-4">
            {quizUnlocked ? (
              <>
                <p className="text-sm text-[#5B6270]">
                  {latestAttempt
                    ? `上次測驗結果：${latestAttempt.score}分（${latestAttempt.passed ? "已通過" : "未通過"}）`
                    : "已完成所有步驟，可以前往作答測驗。"}
                </p>
                <Link
                  href={`/quizzes/${quiz.id}/take`}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  前往測驗
                </Link>
              </>
            ) : (
              <p className="text-sm text-[#8B93A1]">🔒 完成所有步驟的已瞭解確認後即可作答測驗</p>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => i - 1)}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-tebiki-bg disabled:opacity-30"
          >
            ‹ 上一步
          </button>
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
            <span className="flex-1 truncate">{step.title}</span>
            {acknowledgedStepIds.has(step.id) && (
              <span className="shrink-0 text-xs text-brand" aria-label="已瞭解">
                ✓
              </span>
            )}
          </button>
        ))}
      </aside>
    </div>
  );
}
