"use client";

import { useState } from "react";
import type { Quiz, QuizAttempt, QuizQuestion } from "@/types/models";

interface AttemptResult {
  score: number;
  passed: boolean;
}

export function QuizTakeClient({
  quiz,
  questions,
  lastAttempt,
}: {
  quiz: Quiz;
  questions: QuizQuestion[];
  lastAttempt: QuizAttempt | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(
    lastAttempt ? { score: lastAttempt.score, passed: lastAttempt.passed } : null
  );
  const [retaking, setRetaking] = useState(false);

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, choiceId]) => ({
            questionId: Number(questionId),
            choiceId: Number(choiceId),
          })),
        }),
      });
      const data = await res.json();
      setResult({ score: data.score, passed: data.passed });
      setRetaking(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (result && !retaking) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed ? "border-brand/30 bg-brand/5" : "border-red-200 bg-red-50"
          }`}
        >
          <p className={`text-3xl font-bold ${result.passed ? "text-brand" : "text-red-600"}`}>
            {result.score}分
          </p>
          <p className="mt-2 text-sm text-[#5B6270]">
            {result.passed ? `已通過（及格分數 ${quiz.passScore}%）` : `未達及格分數 ${quiz.passScore}%`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setRetaking(true);
          }}
          className="rounded-lg border border-app-border px-5 py-2.5 text-sm font-medium text-[#2B2C2F] hover:bg-app-bg"
        >
          重新作答
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-white p-10 text-center text-sm text-[#8B93A1]">
        這份測驗還沒有任何題目。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <div key={q.id} className="rounded-xl border border-app-border bg-white p-6">
          <p className="mb-3 text-sm font-bold text-[#2B2C2F]">
            {index + 1}. {q.prompt}
          </p>
          <div className="space-y-2">
            {q.choices.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-app-border px-3 py-2 text-sm hover:bg-app-bg"
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === c.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: c.id }))}
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={handleSubmit}
        className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "送出中…" : "送出測驗"}
      </button>
    </div>
  );
}
