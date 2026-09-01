"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderIcon, PlusIcon } from "./icons";
import type { TebikiFolder } from "@/types/tebiki";

export function FolderManager({ folders, canDelete }: { folders: TebikiFolder[]; canDelete: boolean }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  async function handleAdd() {
    if (!name.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    setAdding(false);
    router.refresh();
  }

  async function handleRename(folder: TebikiFolder) {
    const next = prompt("資料夾名稱", folder.name);
    if (!next || !next.trim() || next.trim() === folder.name) return;
    await fetch(`/api/folders/${folder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next.trim() }),
    });
    router.refresh();
  }

  async function handleDelete(folder: TebikiFolder) {
    if (!confirm(`確定要刪除資料夾「${folder.name}」嗎？（資料夾內的手冊不會被刪除）`)) return;
    const res = await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("刪除失敗，你可能沒有權限執行此操作。");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-4 rounded-xl border border-tebiki-border bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#2B2C2F]">
          <FolderIcon className="h-4 w-4" />
          資料夾管理
        </h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-tebiki-border px-3 py-1.5 text-xs font-medium text-[#2B2C2F] hover:bg-tebiki-bg"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          新增資料夾
        </button>
      </div>

      {adding && (
        <div className="flex items-center gap-2 border-t border-tebiki-border px-6 py-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="資料夾名稱"
            className="flex-1 rounded-lg border border-tebiki-border px-3 py-2 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            新增
          </button>
        </div>
      )}

      {folders.length > 0 && (
        <ul className="divide-y divide-tebiki-border border-t border-tebiki-border">
          {folders.map((f) => (
            <li key={f.id} className="flex items-center gap-2 px-6 py-2.5 text-sm text-[#2B2C2F]">
              <FolderIcon className="h-4 w-4 shrink-0 text-[#8B93A1]" />
              <span className="flex-1">{f.name}</span>
              <button
                type="button"
                onClick={() => handleRename(f)}
                className="text-xs text-[#8B93A1] hover:text-brand"
              >
                重新命名
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(f)}
                  className="text-xs text-[#8B93A1] hover:text-red-600"
                >
                  刪除
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
