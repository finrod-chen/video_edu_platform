"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlusIcon } from "./icons";
import type { PickableUser, UserGroupWithMembers } from "@/types/models";

export function GroupsClient({
  groups,
  allUsers,
}: {
  groups: UserGroupWithMembers[];
  allUsers: PickableUser[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });
    setName("");
    setDescription("");
    setAdding(false);
    router.refresh();
  }

  async function handleRename(group: UserGroupWithMembers) {
    const next = prompt("群組名稱", group.name);
    if (!next || !next.trim() || next.trim() === group.name) return;
    await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next.trim() }),
    });
    router.refresh();
  }

  async function handleDelete(group: UserGroupWithMembers) {
    if (!confirm(`確定要刪除群組「${group.name}」嗎？`)) return;
    await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleToggleMember(group: UserGroupWithMembers, userId: string) {
    const nextMemberIds = group.memberIds.includes(userId)
      ? group.memberIds.filter((id) => id !== userId)
      : [...group.memberIds, userId];
    await fetch(`/api/groups/${group.id}/members`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: nextMemberIds.map(Number) }),
    });
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#5B6270]">管理使用者群組，方便指派手冊/課程時一次選取整組人員。</p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          <PlusIcon className="h-4 w-4" />
          新用戶群組
        </button>
      </div>

      {adding && (
        <div className="mb-4 flex items-end gap-2 rounded-xl border border-app-border bg-white p-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[#8B93A1]">名稱</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[#8B93A1]">描述（選填）</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            新增
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-app-border bg-white py-20 text-center text-sm text-[#8B93A1]">
          沒有數據
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-xl border border-app-border bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-[#2B2C2F]">{g.name}</p>
                  <p className="text-xs text-[#8B93A1]">
                    {g.description || "—"}・{g.memberIds.length} 位成員
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedId((id) => (id === g.id ? null : g.id))}
                    className="text-brand hover:underline"
                  >
                    {expandedId === g.id ? "收合成員" : "管理成員"}
                  </button>
                  <button type="button" onClick={() => handleRename(g)} className="text-[#8B93A1] hover:text-brand">
                    重新命名
                  </button>
                  <button type="button" onClick={() => handleDelete(g)} className="text-[#8B93A1] hover:text-red-600">
                    刪除
                  </button>
                </div>
              </div>

              {expandedId === g.id && (
                <div className="max-h-56 space-y-1 overflow-y-auto border-t border-app-border p-4">
                  {allUsers.map((u) => (
                    <label
                      key={u.id}
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-app-bg"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={g.memberIds.includes(u.id)}
                        onChange={() => handleToggleMember(g, u.id)}
                      />
                      <span>{u.name}</span>
                      <span className="text-xs text-[#8B93A1]">{u.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
