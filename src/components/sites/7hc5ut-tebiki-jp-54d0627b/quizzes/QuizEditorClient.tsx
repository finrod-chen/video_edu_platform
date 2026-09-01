"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, PlusIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import type { ManualStatus, TebikiQuiz, TebikiQuizQuestion } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export function QuizEditorClient({
  quiz,
  targetTitle,
  initialQuestions,
  canPermanentlyDelete,
}: {
  quiz: TebikiQuiz;
  targetTitle: string;
  initialQuestions: TebikiQuizQuestion[];
  canPermanentlyDelete: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(quiz.title);
  const [passScore, setPassScore] = useState(quiz.passScore);
  const [status, setStatus] = useState<ManualStatus>(quiz.status);
  const [questions, setQuestions] = useState(initialQuestions);
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patchQuiz(fields: Partial<{ title: string; passScore: number; status: ManualStatus }>) {
    setSavingMeta(true);
    try {
      await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
    } finally {
      setSavingMeta(false);
    }
  }

  async function setNewStatus(next: ManualStatus) {
    setStatus(next);
    await patchQuiz({ status: next });
  }

  async function handleTrash() {
    if (!confirm("確定要把這份測驗移到垃圾桶嗎？")) return;
    await setNewStatus("trashed");
  }

  async function handlePermanentDelete() {
    if (!confirm("確定要永久刪除這份測驗嗎？包含所有題目與作答紀錄，此動作無法復原。")) return;
    setDeleting(true);
    const res = await fetch(`/api/quizzes/${quiz.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/quizzes");
    } else {
      setDeleting(false);
      alert("刪除失敗，你可能沒有權限執行此操作。");
    }
  }

  async function handleAddQuestion() {
    const res = await fetch(`/api/quizzes/${quiz.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `題目 ${questions.length + 1}` }),
    });
    const { id } = await res.json();
    setQuestions((prev) => [
      ...prev,
      { id: String(id), quizId: quiz.id, position: prev.length, prompt: `題目 ${prev.length + 1}`, choices: [] },
    ]);
  }

  async function handlePromptChange(questionId: string, prompt: string) {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, prompt } : q)));
    await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("確定要刪除這道題目嗎？")) return;
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}`, { method: "DELETE" });
  }

  async function handleMoveQuestion(questionId: string, direction: "up" | "down") {
    const index = questions.findIndex((q) => q.id === questionId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= questions.length) return;

    const next = [...questions];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setQuestions(next);

    await fetch(`/api/quizzes/${quiz.id}/questions/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: next.map((q) => Number(q.id)) }),
    });
  }

  async function handleAddChoice(questionId: string) {
    const question = questions.find((q) => q.id === questionId);
    const label = `選項 ${(question?.choices.length ?? 0) + 1}`;
    const res = await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}/choices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, isCorrect: false }),
    });
    const { id } = await res.json();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, choices: [...q.choices, { id: String(id), label, isCorrect: false }] } : q
      )
    );
  }

  async function handleChoiceLabelChange(questionId: string, choiceId: string, label: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, label } : c)) }
          : q
      )
    );
    await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}/choices/${choiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
  }

  async function handleSetCorrect(questionId: string, choiceId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => ({ ...c, isCorrect: c.id === choiceId })) }
          : q
      )
    );
    await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}/choices/${choiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCorrect: true }),
    });
  }

  async function handleDeleteChoice(questionId: string, choiceId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, choices: q.choices.filter((c) => c.id !== choiceId) } : q
      )
    );
    await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}/choices/${choiceId}`, { method: "DELETE" });
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
                  {status === "published" ? "取消發布" : "發布測驗"}
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

        <p className="mb-4 text-sm text-[#8B93A1]">
          {quiz.scope === "manual" ? "手冊單元測驗" : "課程結業總測驗"}：{targetTitle}
        </p>

        <label htmlFor="quiz-title" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          測驗標題
        </label>
        <input
          id="quiz-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => patchQuiz({ title })}
          className="mb-4 w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />

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
          onBlur={() => patchQuiz({ passScore })}
          className="w-32 rounded-lg border border-tebiki-border px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-[#2B2C2F]">題目（{questions.length}）</h2>

        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-xl border border-tebiki-border bg-white p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1 text-[#8B93A1]">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveQuestion(q.id, "up")}
                    className="rotate-180 disabled:opacity-30"
                    aria-label="上移"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-[#2B2C2F]">{index + 1}</span>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => handleMoveQuestion(q.id, "down")}
                    className="disabled:opacity-30"
                    aria-label="下移"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>
                <input
                  defaultValue={q.prompt}
                  onBlur={(e) => handlePromptChange(q.id, e.target.value)}
                  placeholder="題目內容"
                  className="flex-1 rounded-lg border border-tebiki-border px-3 py-2 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-xs text-[#8B93A1] hover:text-red-600"
                >
                  刪除題目
                </button>
              </div>

              <div className="ml-9 space-y-2">
                {q.choices.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={c.isCorrect === true}
                      onChange={() => handleSetCorrect(q.id, c.id)}
                      aria-label="設為正解"
                    />
                    <input
                      defaultValue={c.label}
                      onBlur={(e) => handleChoiceLabelChange(q.id, c.id, e.target.value)}
                      placeholder="選項內容"
                      className="flex-1 rounded-lg border border-tebiki-border px-3 py-1.5 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteChoice(q.id, c.id)}
                      className="text-xs text-[#8B93A1] hover:text-red-600"
                    >
                      刪除
                    </button>
                  </div>
                ))}
                {q.choices.length < 6 && (
                  <button
                    type="button"
                    onClick={() => handleAddChoice(q.id)}
                    className="flex items-center gap-1 text-xs text-brand hover:underline"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    新增選項
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-tebiki-border px-4 py-2.5 text-sm text-[#5B6270] hover:border-brand hover:text-brand"
        >
          <PlusIcon className="h-4 w-4" />
          新增題目
        </button>
      </div>
    </div>
  );
}
