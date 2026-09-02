"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BatchCaptionsButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`確定要為 ${pendingCount} 支尚無字幕的影片批次產生字幕嗎？系統會在背景依序處理。`)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/manuals/batch-captions", { method: "POST" });
      const data = await res.json();
      setMessage(`已排入背景處理，共 ${data.count} 支影片。`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        disabled={submitting}
        onClick={handleClick}
        className="rounded-lg border border-app-border px-4 py-2 text-sm font-medium text-[#2B2C2F] hover:bg-app-bg disabled:opacity-50"
      >
        {submitting ? "處理中…" : `批次補字幕（${pendingCount}）`}
      </button>
      {message && <span className="text-xs text-[#8B93A1]">{message}</span>}
    </div>
  );
}
