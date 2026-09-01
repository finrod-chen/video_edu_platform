"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import type { TebikiCourse, TebikiCourseManual, TebikiManual } from "@/types/tebiki";

export function CourseDetailClient({
  course,
  initialManuals,
  availableManuals,
}: {
  course: TebikiCourse;
  initialManuals: TebikiCourseManual[];
  availableManuals: TebikiManual[];
}) {
  const [manuals, setManuals] = useState(initialManuals);
  const [selectedManualId, setSelectedManualId] = useState("");

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

  async function handleRemove(manualId: string) {
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

  return (
    <div className="rounded-xl border border-tebiki-border bg-white p-6">
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

      {manuals.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#8B93A1]">這個課程還沒有加入任何手冊。</p>
      ) : (
        <ul className="divide-y divide-tebiki-border">
          {manuals.map((m, index) => (
            <li key={m.manualId} className="flex items-center gap-3 py-3">
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
              <span className="w-6 text-xs text-[#8B93A1]">{index + 1}</span>
              <Link href={`/manuals/${m.manualId}`} className="flex-1 text-sm text-brand hover:underline">
                {m.title}
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(m.manualId)}
                className="text-xs text-[#8B93A1] hover:text-red-600"
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
