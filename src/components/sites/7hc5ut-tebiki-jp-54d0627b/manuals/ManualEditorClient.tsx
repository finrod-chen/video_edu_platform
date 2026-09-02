"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepCard } from "./StepCard";
import { ManualQuizLink } from "./ManualQuizLink";
import { PlusIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import type {
  ManualStatus,
  ManualStepEditData,
  TebikiFolder,
  TebikiManual,
  TebikiManualStep,
  TebikiQuiz,
  TebikiTag,
} from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export function ManualEditorClient({
  manual,
  initialSteps,
  initialTags,
  folders,
  canPermanentlyDelete,
  initialQuiz,
}: {
  manual: TebikiManual;
  initialSteps: TebikiManualStep[];
  initialTags: TebikiTag[];
  folders: TebikiFolder[];
  canPermanentlyDelete: boolean;
  initialQuiz: TebikiQuiz | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(manual.title);
  const [description, setDescription] = useState(manual.description ?? "");
  const [status, setStatus] = useState<ManualStatus>(manual.status ?? "draft");
  const [folderId, setFolderId] = useState(manual.folderId ?? "");
  const [steps, setSteps] = useState(initialSteps);
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patchManual(
    fields: Partial<{ title: string; description: string; status: ManualStatus; folderId: number | null }>
  ) {
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

  async function handleFolderChange(next: string) {
    setFolderId(next);
    await patchManual({ folderId: next ? Number(next) : null });
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
        captionStatus: "none" as const,
        editData: null,
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
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              videoPath,
              thumbnailPath: thumbnailPath ?? s.thumbnailPath,
              captionsVtt: null,
              captionStatus: "none",
            }
          : s
      )
    );
  }

  function handleEditDataSaved(stepId: string, editData: ManualStepEditData) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, editData } : s)));
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

  async function handleAddTag() {
    if (!newTag.trim()) return;
    const res = await fetch(`/api/manuals/${manual.id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    const tag = await res.json();
    if (!tags.some((t) => t.id === tag.id)) {
      setTags((prev) => [...prev, tag]);
    }
    setNewTag("");
  }

  async function handleRemoveTag(tagId: string) {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    await fetch(`/api/manuals/${manual.id}/tags/${tagId}`, { method: "DELETE" });
  }

  async function setNewStatus(next: ManualStatus) {
    setStatus(next);
    await patchManual({ status: next });
  }

  async function handleTrash() {
    if (!confirm("確定要把這份手冊移到垃圾桶嗎？")) return;
    await setNewStatus("trashed");
  }

  async function handlePermanentDelete() {
    if (!confirm("確定要永久刪除這份手冊嗎？包含所有步驟與影片，此動作無法復原。")) return;
    setDeleting(true);
    const res = await fetch(`/api/manuals/${manual.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/trashes");
    } else {
      setDeleting(false);
      alert("刪除失敗，你可能沒有權限執行此操作。");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-tebiki-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-tebiki-bg px-3 py-1 text-xs font-medium text-[#5B6270]">
            {STATUS_LABEL[status]}
            {savingMeta && "・儲存中…"}
          </span>

          <div className="flex items-center gap-2">
            {status !== "trashed" ? (
              <>
                <button
                  type="button"
                  onClick={handleTrash}
                  className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#5B6270] hover:bg-tebiki-bg"
                >
                  移到垃圾桶
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus(status === "published" ? "draft" : "published")}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  {status === "published" ? "取消發布" : "發布手冊"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setNewStatus("draft")}
                  className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#5B6270] hover:bg-tebiki-bg"
                >
                  還原為草稿
                </button>
                {canPermanentlyDelete && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handlePermanentDelete}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    永久刪除
                  </button>
                )}
              </>
            )}
          </div>
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
          className="mb-4 w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />

        <label htmlFor="manual-folder" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          資料夾（選填）
        </label>
        <select
          id="manual-folder"
          value={folderId}
          onChange={(e) => handleFolderChange(e.target.value)}
          className="mb-4 w-full max-w-xs rounded-lg border border-tebiki-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">不放入資料夾</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <p className="mb-1 text-sm font-bold text-[#2B2C2F]">標籤</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 rounded-full bg-tebiki-bg px-3 py-1 text-xs text-[#2B2C2F]"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                aria-label={`移除標籤 ${tag.name}`}
                className="text-[#8B93A1] hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            placeholder="新增標籤"
            className="w-48 rounded-lg border border-tebiki-border px-3 py-1.5 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg border border-tebiki-border px-3 py-1.5 text-sm text-[#5B6270] hover:bg-tebiki-bg"
          >
            加入
          </button>
        </div>
      </div>

      <ManualQuizLink manualId={manual.id} manualTitle={title} quiz={initialQuiz} />

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
              onEditDataSaved={handleEditDataSaved}
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
