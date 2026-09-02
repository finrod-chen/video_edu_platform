"use client";

import { useRef, useState } from "react";
import { uploadManualAttachment } from "@/lib/upload-client";
import type { ManualAttachment } from "@/types/models";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ManualAttachments({
  manualId,
  initialAttachments,
}: {
  manualId: string;
  initialAttachments: ManualAttachment[];
}) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(file: File) {
    setError(null);
    setUploading(true);
    try {
      const result = await uploadManualAttachment(manualId, file);
      setAttachments((prev) => [
        { id: result.id, manualId: result.manualId, fileName: result.fileName, fileSize: result.fileSize, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗，請再試一次。");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm("確定要刪除這份附件嗎？此動作無法復原。")) return;
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    await fetch(`/api/manuals/${manualId}/attachments/${attachmentId}`, { method: "DELETE" });
  }

  return (
    <div className="rounded-xl border border-app-border bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#2B2C2F]">SOP／表單附件（PDF）</h2>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-app-border px-4 py-2 text-sm text-[#5B6270] hover:bg-app-bg disabled:opacity-50"
        >
          {uploading ? "上傳中…" : "＋上傳 PDF"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileSelected(file);
            e.target.value = "";
          }}
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-[#8B93A1]">還沒有上傳任何附件。</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-app-border px-3 py-2 text-sm"
            >
              <span className="truncate text-[#2B2C2F]">{a.fileName}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-[#8B93A1]">{formatFileSize(a.fileSize)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
