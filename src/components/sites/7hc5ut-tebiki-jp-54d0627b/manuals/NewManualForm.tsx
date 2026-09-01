"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewManualForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error("建立失敗");
      const { id } = await res.json();
      router.push(`/manuals/${id}/edit`);
    } catch {
      setError("建立失敗，請再試一次。");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="manual-title" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
          手冊標題
        </label>
        <input
          id="manual-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：新進人員教育訓練 SOP"
          autoFocus
          className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "建立中…" : "建立並繼續編輯"}
      </button>
    </form>
  );
}
