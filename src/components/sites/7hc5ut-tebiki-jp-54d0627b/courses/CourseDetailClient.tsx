"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import type { ManualStatus, TebikiCourse, TebikiCourseManual, TebikiManual } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export function CourseDetailClient({
  course,
  initialManuals,
  availableManuals,
  canManage,
  canPermanentlyDelete,
}: {
  course: TebikiCourse;
  initialManuals: TebikiCourseManual[];
  availableManuals: TebikiManual[];
  canManage: boolean;
  canPermanentlyDelete: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ManualStatus>(course.status ?? "draft");
  const [manuals, setManuals] = useState(initialManuals);
  const [selectedManualId, setSelectedManualId] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const addableManuals = availableManuals.filter(
    (m) => !manuals.some((cm) => cm.manualId === m.id)
  );

  async function handleAdd() {
    if (!selectedManualId) return;
    const manual = availableManuals.find((m) => m.id === selectedManualId);
    if (!manual) return;

    await fetch(`/api/courses/${course.id}/manuals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualId: Number(selectedManualId) }),
    });
    setManuals((prev) => [...prev, { manualId: manual.id, title: manual.title, position: prev.length }]);
    setSelectedManualId("");
  }

  async function handleRemove(manualId: string, title: string) {
    if (!confirm(`確定要把「${title}」從這個課程移除嗎？（手冊本身不會被刪除）`)) return;
    setManuals((prev) => prev.filter((m) => m.manualId !== manualId));
    await fetch(`/api/courses/${course.id}/manuals?manualId=${manualId}`, { method: "DELETE" });
  }

  async function handleMove(manualId: string, direction: "up" | "down") {
    const index = manuals.findIndex((m) => m.manualId === manualId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= manuals.length) return;

    const next = [...manuals];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setManuals(next);

    await fetch(`/api/courses/${course.id}/manuals`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualIds: next.map((m) => Number(m.manualId)) }),
    });
  }

  async function setNewStatus(next: ManualStatus) {
    setStatus(next);
    setSavingStatus(true);
    try {
      await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleTrash() {
    if (!confirm("確定要把這個課程移到垃圾桶嗎？")) return;
    await setNewStatus("trashed");
  }

  async function handlePermanentDelete() {
    if (!confirm("確定要永久刪除這個課程嗎？（課程內的手冊不會被刪除，此動作無法復原。）")) return;
    setDeleting(true);
    const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/courses");
    } else {
      setDeleting(false);
      alert("刪除失敗，你可能沒有權限執行此操作。");
    }
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex items-center justify-between rounded-xl border border-tebiki-border bg-white p-6">
          <span className="rounded-full bg-tebiki-bg px-3 py-1 text-xs font-medium text-[#5B6270]">
            {STATUS_LABEL[status]}
            {savingStatus && "・儲存中…"}
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
                  {status === "published" ? "取消發布" : "發布課程"}
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
      )}

      <div className="rounded-xl border border-tebiki-border bg-white p-6">
        {canManage && (
          <div className="mb-4 flex items-center gap-2">
            <select
              value={selectedManualId}
              onChange={(e) => setSelectedManualId(e.target.value)}
              className="flex-1 rounded-lg border border-tebiki-border px-3 py-2 text-sm"
            >
              <option value="">選擇要加入的已發布手冊…</option>
              {addableManuals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedManualId}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              加入手冊
            </button>
          </div>
        )}

        {manuals.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8B93A1]">這個課程還沒有加入任何手冊。</p>
        ) : (
          <ul className="divide-y divide-tebiki-border">
            {manuals.map((m, index) => (
              <li key={m.manualId} className="flex items-center gap-3 py-3">
                {canManage && (
                  <div className="flex flex-col text-[#8B93A1]">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(m.manualId, "up")}
                      className="rotate-180 disabled:opacity-30"
                      aria-label="上移"
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === manuals.length - 1}
                      onClick={() => handleMove(m.manualId, "down")}
                      className="disabled:opacity-30"
                      aria-label="下移"
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <span className="w-6 text-xs text-[#8B93A1]">{index + 1}</span>
                <Link href={`/manuals/${m.manualId}`} className="flex-1 text-sm text-brand hover:underline">
                  {m.title}
                </Link>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.manualId, m.title)}
                    className="text-xs text-[#8B93A1] hover:text-red-600"
                  >
                    移除
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
