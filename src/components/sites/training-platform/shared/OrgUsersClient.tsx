"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "./icons";
import type { OrgUserRow } from "@/lib/queries/users";

const ROLE_OPTIONS = ["管理員", "編輯", "員工"];

export function OrgUsersClient({
  members,
  memberCount,
  currentUserId,
}: {
  members: OrgUserRow[];
  memberCount: number;
  currentUserId: string;
}) {
  const [users, setUsers] = useState(members);
  const [keyword, setKeyword] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) => u.name.includes(keyword) || u.email.includes(keyword));

  async function handleRoleChange(userId: string, role: string) {
    const previous = users;
    setError(null);
    setPendingId(userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));

    try {
      const res = await fetch(`/api/org/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "更新失敗");
      }
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setPendingId(null);
    }
  }

  async function handleStatusToggle(userId: string, nextStatus: "active" | "disabled") {
    const previous = users;
    setError(null);
    setPendingId(userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));

    try {
      const res = await fetch(`/api/org/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "更新失敗");
      }
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-app-border px-4 py-2 text-sm text-[#5B6270]">
          <span>
            使用者人數： <strong className="text-[#2B2C2F]">{memberCount}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 py-4">
        <label className="relative flex flex-1 items-center">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
          <input
            type="search"
            placeholder="使用者名稱"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-app-border py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </label>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#8B93A1]">
            <th className="py-3 font-medium">使用者名稱</th>
            <th className="py-3 font-medium">Email</th>
            <th className="py-3 font-medium">角色</th>
            <th className="py-3 font-medium">狀態</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => {
            const disabled = m.status === "disabled";
            return (
              <tr key={m.id} className={cn("border-t border-app-border", disabled && "opacity-50")}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.avatarInitial}
                    </span>
                    <p className="text-[#2B2C2F]">{m.name}</p>
                  </div>
                </td>
                <td className="py-3 text-[#8B93A1]">{m.email}</td>
                <td className="py-3">
                  <select
                    value={m.role}
                    disabled={pendingId === m.id || disabled}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="rounded-lg border border-app-border px-3 py-1.5 text-sm text-[#2B2C2F] disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {m.id === currentUserId && (
                    <span className="ml-2 text-xs text-[#8B93A1]">（我）</span>
                  )}
                </td>
                <td className="py-3">
                  {m.id === currentUserId ? (
                    <span className="text-xs text-[#8B93A1]">—</span>
                  ) : (
                    <button
                      type="button"
                      disabled={pendingId === m.id}
                      onClick={() => handleStatusToggle(m.id, disabled ? "active" : "disabled")}
                      className={cn(
                        "text-xs hover:underline disabled:opacity-50",
                        disabled ? "text-brand" : "text-red-600"
                      )}
                    >
                      {disabled ? "恢復" : "停用"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
