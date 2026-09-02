"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ManualStatus, TebikiQuiz } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export function ManualQuizLink({
  manualId,
  manualTitle,
  quiz,
}: {
  manualId: string;
  manualTitle: string;
  quiz: TebikiQuiz | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "manual",
          manualId: Number(manualId),
          title: `${manualTitle || "手冊"} 測驗`,
          passScore: 60,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "建立測驗失敗，請再試一次。");
        return;
      }
      const { id } = await res.json();
      router.push(`/quizzes/${id}/edit`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-xl border border-tebiki-border bg-white p-6">
      <h2 className="mb-3 text-sm font-bold text-[#2B2C2F]">測驗</h2>
      {quiz ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#2B2C2F]">{quiz.title}</p>
            <span className="mt-1 inline-block rounded-full bg-tebiki-bg px-2.5 py-0.5 text-xs text-[#5B6270]">
              {STATUS_LABEL[quiz.status]}
            </span>
          </div>
          <Link href={`/quizzes/${quiz.id}/edit`} className="text-sm text-brand hover:underline">
            編輯測驗 ›
          </Link>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-[#8B93A1]">這份手冊還沒有綁定測驗。</p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#5B6270] hover:bg-tebiki-bg disabled:opacity-50"
          >
            ＋建立測驗
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
