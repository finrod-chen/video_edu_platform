"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EditableVideoPlayer } from "./EditableVideoPlayer";
import { EditableImage } from "./EditableImage";
import type {
  Manual,
  ManualAttachment,
  ManualStep,
  Quiz,
  QuizAttempt,
} from "@/types/models";

const WATCH_FLUSH_INTERVAL_MS = 30_000;
// Deltas beyond this are a seek/trim-skip/freeze-jump, not real watching time.
const MAX_COUNTABLE_DELTA_SECONDS = 2;

export function ManualViewerClient({
  manual,
  steps,
  initialAcknowledgedStepIds,
  quiz,
  quizUnlocked: initialQuizUnlocked,
  latestAttempt,
  attachments,
}: {
  manual: Manual;
  steps: ManualStep[];
  initialAcknowledgedStepIds: string[];
  quiz: Quiz | null;
  quizUnlocked: boolean;
  latestAttempt: QuizAttempt | null;
  attachments: ManualAttachment[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [acknowledgedStepIds, setAcknowledgedStepIds] = useState(new Set(initialAcknowledgedStepIds));
  const [quizUnlocked, setQuizUnlocked] = useState(initialQuizUnlocked);
  const [acknowledging, setAcknowledging] = useState(false);
  const [openAttachmentId, setOpenAttachmentId] = useState<string | null>(null);
  const activeStep = steps[activeIndex];
  const openAttachment = attachments.find((a) => a.id === openAttachmentId) ?? null;

  const lastTimeRef = useRef<number | null>(null);
  const pendingSecondsRef = useRef(0);

  function flushWatchSeconds(useBeacon = false) {
    const seconds = pendingSecondsRef.current;
    if (seconds <= 0) return;
    pendingSecondsRef.current = 0;
    const body = JSON.stringify({ watchedSeconds: seconds });
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        `/api/manuals/${manual.id}/view-ping`,
        new Blob([body], { type: "application/json" })
      );
    } else {
      void fetch(`/api/manuals/${manual.id}/view-ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  }

  // Registers a "visit" on mount (counts even for image-only steps), and
  // periodically/on-unload flushes accumulated watch time from onTimeUpdate.
  useEffect(() => {
    void fetch(`/api/manuals/${manual.id}/view-ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchedSeconds: 0 }),
    });

    const interval = setInterval(() => flushWatchSeconds(), WATCH_FLUSH_INTERVAL_MS);
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flushWatchSeconds(true);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleVisibilityChange);
      flushWatchSeconds(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual.id]);

  function handleVideoTimeUpdate(time: number) {
    const last = lastTimeRef.current;
    if (last !== null) {
      const delta = time - last;
      if (delta > 0 && delta <= MAX_COUNTABLE_DELTA_SECONDS) {
        pendingSecondsRef.current += delta;
      }
    }
    lastTimeRef.current = time;
  }

  useEffect(() => {
    lastTimeRef.current = null;
  }, [activeIndex]);

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-white p-10 text-center text-sm text-[#8B93A1]">
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
        {activeStep.mediaType === "image" && activeStep.imagePath ? (
          <EditableImage
            key={activeStep.id}
            src={`/api/media/manuals/${manual.id}/steps/${activeStep.id}/image`}
            annotations={activeStep.editData?.annotations ?? []}
          />
        ) : activeStep.mediaType === "video" && activeStep.videoPath ? (
          <EditableVideoPlayer
            key={activeStep.id}
            src={`/api/media/manuals/${manual.id}/steps/${activeStep.id}`}
            poster={
              activeStep.thumbnailPath
                ? `/api/media/manuals/${manual.id}/steps/${activeStep.id}/thumbnail`
                : undefined
            }
            captionSrc={
              activeStep.captionStatus === "done"
                ? `/api/media/manuals/${manual.id}/steps/${activeStep.id}/captions.vtt`
                : undefined
            }
            editData={activeStep.editData}
            onTimeUpdate={handleVideoTimeUpdate}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-sm text-white/60">
            此步驟尚未上傳內容
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-app-border bg-white p-4">
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
          <div className="mt-4 flex items-center justify-between rounded-xl border border-app-border bg-white p-4">
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
            className="rounded-lg border border-app-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-app-bg disabled:opacity-30"
          >
            ‹ 上一步
          </button>
          <button
            type="button"
            disabled={activeIndex === steps.length - 1}
            onClick={() => setActiveIndex((i) => i + 1)}
            className="rounded-lg border border-app-border px-4 py-2 text-sm text-[#2B2C2F] hover:bg-app-bg disabled:opacity-30"
          >
            下一步 ›
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        {attachments.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-[#8B93A1]">相關文件</p>
            <ul className="space-y-1">
              {attachments.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setOpenAttachmentId(a.id)}
                    className="w-full truncate rounded-lg px-3 py-2 text-left text-sm text-brand hover:bg-app-bg hover:underline"
                  >
                    📄 {a.fileName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-1">
        <p className="mb-2 text-xs font-medium text-[#8B93A1]">步驟導覽</p>
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
              index === activeIndex ? "bg-brand/10 text-brand font-medium" : "text-[#2B2C2F] hover:bg-app-bg"
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-bg text-xs">
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
        </div>
      </aside>

      {openAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
              <p className="truncate text-sm font-bold text-[#2B2C2F]">{openAttachment.fileName}</p>
              <button
                type="button"
                onClick={() => setOpenAttachmentId(null)}
                className="text-sm text-[#8B93A1] hover:text-[#2B2C2F]"
              >
                關閉
              </button>
            </div>
            <iframe
              src={`/api/media/manuals/${manual.id}/attachments/${openAttachment.id}#toolbar=0&navpanes=0`}
              title={openAttachment.fileName}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
