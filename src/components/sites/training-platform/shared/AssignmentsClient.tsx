"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "./EmptyState";
import { PlusIcon } from "./icons";
import type { Assignment, Manual, User } from "@/types/models";

export function AssignmentsClient({
  assignments,
  manuals,
  employees,
}: {
  assignments: Assignment[];
  manuals: Manual[];
  employees: User[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [manualId, setManualId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleSubmit() {
    if (!manualId || selectedUserIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualId: Number(manualId),
          userIds: selectedUserIds.map(Number),
          dueDate: dueDate || null,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("建立失敗");
      const data = await res.json();
      if (data.failedEmails?.length > 0) {
        setError(`指派已建立，但以下信箱寄信失敗：${data.failedEmails.join("、")}`);
      }
      setManualId("");
      setSelectedUserIds([]);
      setDueDate("");
      setNote("");
      setAdding(false);
      router.refresh();
    } catch {
      setError("建立失敗，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">指派管理</h1>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          <PlusIcon className="h-4 w-4" />
          新增指派
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {adding && (
        <div className="mb-4 space-y-4 rounded-xl border border-app-border bg-white p-6">
          <div>
            <label htmlFor="assign-manual" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
              手冊
            </label>
            <select
              id="assign-manual"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-app-border px-3 py-2 text-sm"
            >
              <option value="">請選擇已發布手冊…</option>
              {manuals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-[#2B2C2F]">指派對象</p>
            <div className="max-h-48 max-w-md space-y-1 overflow-y-auto rounded-lg border border-app-border p-2">
              {employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-app-bg">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(e.id)}
                    onChange={() => toggleUser(e.id)}
                  />
                  <span>{e.name}</span>
                  <span className="text-xs text-[#8B93A1]">{e.email}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex max-w-md gap-4">
            <div className="flex-1">
              <label htmlFor="assign-due" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
                期限（選填）
              </label>
              <input
                id="assign-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-app-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="assign-note" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
              備註（選填）
            </label>
            <textarea
              id="assign-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full max-w-md rounded-lg border border-app-border px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!manualId || selectedUserIds.length === 0 || submitting}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting ? "建立中…" : "建立指派"}
          </button>
        </div>
      )}

      <div className="rounded-xl border border-app-border bg-white">
        {assignments.length === 0 ? (
          <EmptyState title="沒有數據" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-app-border text-left text-[#8B93A1]">
                <th className="px-6 py-3 font-medium">手冊</th>
                <th className="px-6 py-3 font-medium">指派人</th>
                <th className="px-6 py-3 font-medium">期限</th>
                <th className="px-6 py-3 font-medium">完成度</th>
                <th className="px-6 py-3 font-medium">備註</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t border-app-border">
                  <td className="px-6 py-3 text-[#2B2C2F]">{a.manualTitle}</td>
                  <td className="px-6 py-3 text-[#5B6270]">{a.assignedByName}</td>
                  <td className="px-6 py-3 text-[#8B93A1]">{a.dueDate ?? "—"}</td>
                  <td className="px-6 py-3 text-[#5B6270]">
                    {a.completedCount}/{a.targetCount}
                  </td>
                  <td className="px-6 py-3 text-[#8B93A1]">{a.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
