"use client";

import { useState } from "react";
import Link from "next/link";
import { StepCard } from "./StepCard";
import { PlusIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import type { ManualStatus, TebikiManual, TebikiManualStep } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾",
};

export function ManualEditorClient({
  manual,
  initialSteps,
}: {
  manual: TebikiManual;
  initialSteps: TebikiManualStep[];
}) {
  const [title, setTitle] = useState(manual.title);
  const [description, setDescription] = useState(manual.description ?? "");
  const [status, setStatus] = useState<ManualStatus>(manual.status ?? "draft");
  const [steps, setSteps] = useState(initialSteps);
  const [savingMeta, setSavingMeta] = useState(false);

  async function patchManual(fields: Partial<{ title: string; description: string; status: ManualStatus }>) {
    setSavingMeta(true);
    try {
      await fetch(`/api/manuals/${manual.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleAddStep() {
    const res = await fetch(`/api/manuals/${manual.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `步驟 ${steps.length + 1}` }),
    });
    const { id } = await res.json();
    setSteps((prev) => [
      ...prev,
      {
        id: String(id),
        manualId: manual.id,
        position: prev.length,
        title: `步驟 ${prev.length + 1}`,
        videoPath: null,
        thumbnailPath: null,
        durationSeconds: null,
        captionsVtt: null,
      },
    ]);
  }

  async function handleDeleteStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    await fetch(`/api/manuals/${manual.id}/steps/${stepId}`, { method: "DELETE" });
  }

  async function handleStepTitleChange(stepId: string, newTitle: string) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, title: newTitle } : s)));
    await fetch(`/api/manuals/${manual.id}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
  }

  function handleStepUploaded(stepId: string, videoPath: string, thumbnailPath?: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, videoPath, thumbnailPath: thumbnailPath ?? s.thumbnailPath } : s))
    );
  }

  async function handleMoveStep(stepId: string, direction: "up" | "down") {
    const index = steps.findIndex((s) => s.id === stepId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= steps.length) return;

    const next = [...steps];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setSteps(next);

    await fetch(`/api/manuals/${manual.id}/steps/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepIds: next.map((s) => Number(s.id)) }),
    });
  }

  async function handleTogglePublish() {
    const nextStatus: ManualStatus = status === "published" ? "draft" : "published";
    setStatus(nextStatus);
    await patchManual({ status: nextStatus });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-tebiki-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-tebiki-bg px-3 py-1 text-xs font-medium text-[#5B6270]">
            {STATUS_LABEL[status]}
            {savingMeta && "・儲存中…"}
          </span>
          <button
            type="button"
            onClick={handleTogglePublish}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            {status === "published" ? "取消發布" : "發布手冊"}
          </button>
        </div>

        <label htmlFor="manual-title" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          標題
        </label>
        <input
          id="manual-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => patchManual({ title })}
          className="mb-4 w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />

        <label htmlFor="manual-description" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          說明（選填）
        </label>
        <textarea
          id="manual-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => patchManual({ description })}
          rows={3}
          className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2B2C2F]">步驟（{steps.length}）</h2>
          {status === "published" && (
            <Link href={`/manuals/${manual.id}`} className="text-sm text-brand hover:underline">
              查看發布頁面 ›
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              manualId={manual.id}
              step={step}
              index={index}
              total={steps.length}
              onTitleChange={handleStepTitleChange}
              onDelete={handleDeleteStep}
              onMove={handleMoveStep}
              onUploaded={handleStepUploaded}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-tebiki-border px-4 py-2.5 text-sm text-[#5B6270] hover:border-brand hover:text-brand"
        >
          <PlusIcon className="h-4 w-4" />
          新增步驟
        </button>
      </div>
    </div>
  );
}
