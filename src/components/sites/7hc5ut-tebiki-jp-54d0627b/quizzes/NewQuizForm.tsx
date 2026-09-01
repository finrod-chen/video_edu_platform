"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizScope, TebikiCourse, TebikiManual } from "@/types/tebiki";

export function NewQuizForm({
  manuals,
  courses,
}: {
  manuals: TebikiManual[];
  courses: TebikiCourse[];
}) {
  const router = useRouter();
  const [scope, setScope] = useState<QuizScope>("manual");
  const [targetId, setTargetId] = useState("");
  const [title, setTitle] = useState("");
  const [passScore, setPassScore] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          title: title.trim(),
          passScore,
          ...(scope === "manual" ? { manualId: Number(targetId) } : { courseId: Number(targetId) }),
        }),
      });
      if (!res.ok) throw new Error("建立失敗");
      const { id } = await res.json();
      router.push(`/quizzes/${id}/edit`);
    } catch {
      setError("建立失敗，請再試一次。");
      setSubmitting(false);
    }
  }

  const targets = scope === "manual" ? manuals : courses;

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <p className="mb-1 text-sm font-bold text-[#2B2C2F]">測驗範圍</p>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={scope === "manual"}
              onChange={() => {
                setScope("manual");
                setTargetId("");
              }}
            />
            手冊單元測驗
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={scope === "course"}
              onChange={() => {
                setScope("course");
                setTargetId("");
              }}
            />
            課程結業總測驗
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="quiz-target" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          {scope === "manual" ? "適用手冊" : "適用課程"}
        </label>
        <select
          id="quiz-target"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm"
        >
          <option value="">請選擇…</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quiz-title" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          測驗標題
        </label>
        <input
          id="quiz-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：新進人員教育訓練 SOP 測驗"
          className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <div>
        <label htmlFor="quiz-pass-score" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          及格分數（%）
        </label>
        <input
          id="quiz-pass-score"
          type="number"
          min={0}
          max={100}
          value={passScore}
          onChange={(e) => setPassScore(Number(e.target.value))}
          className="w-32 rounded-lg border border-tebiki-border px-3 py-2.5 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!title.trim() || !targetId || submitting}
        className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "建立中…" : "建立並繼續編輯"}
      </button>
    </form>
  );
}
