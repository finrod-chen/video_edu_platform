"use client";

import { useState } from "react";
import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";
import { mockUser } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { SearchIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { cn } from "@/lib/utils";

export default function OrgUsersPage() {
  const [tab, setTab] = useState<"members" | "invites">("members");

  return (
    <OrgSettingsShell active="使用者管理" breadcrumbExtra="使用者管理">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-tebiki-border px-4 py-2 text-sm text-[#5B6270]">
          <span>
            用法： <strong className="text-[#2B2C2F]">3</strong>（邀請：2）/ 5
          </span>
          <span className="text-tebiki-border">|</span>
          <span>
            可註冊用戶數： <strong className="text-[#2B2C2F]">2</strong>{" "}
            <a href="#" className="text-tebiki-blue hover:underline">
              增加您的合約帳戶
            </a>
          </span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-tebiki-border px-4 py-2 text-sm font-medium text-[#2B2C2F] hover:bg-tebiki-bg">
            使用 CSV 進行批量註冊
          </button>
          <button className="rounded-lg bg-tebiki-blue px-4 py-2 text-sm font-bold text-white hover:bg-tebiki-blue-dark">
            註冊用戶
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-tebiki-border">
        {[
          { key: "members" as const, label: "隸屬關係 (1)" },
          { key: "invites" as const, label: "邀請 (2)" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm transition-colors",
              tab === t.key
                ? "border-tebiki-blue font-medium text-tebiki-blue"
                : "border-transparent text-[#5B6270] hover:text-[#2B2C2F]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 py-4">
        <select className="rounded-lg border border-tebiki-border px-3 py-2 text-sm text-[#2B2C2F]">
          <option>所有人</option>
        </select>
        <label className="relative flex flex-1 items-center">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
          <input
            type="search"
            placeholder="使用者名稱"
            className="w-full max-w-xs rounded-lg border border-tebiki-border py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-tebiki-blue/40"
          />
        </label>
        <button className="ml-auto rounded-lg border border-tebiki-border px-4 py-2 text-sm font-medium text-[#2B2C2F] hover:bg-tebiki-bg">
          使用 CSV 檔案進行批次編輯/刪除
        </button>
      </div>

      {tab === "members" ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#8B93A1]">
              <th className="py-3 font-medium">使用者名稱</th>
              <th className="py-3 font-medium">使用者群組</th>
              <th className="py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-tebiki-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: mockUser.avatarColor }}
                  >
                    {mockUser.avatarInitial}
                  </span>
                  <div>
                    <p className="text-xs text-[#8B93A1]">{mockUser.role}</p>
                    <p className="text-tebiki-blue">{mockUser.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-[#8B93A1]">—</td>
              <td className="py-3 text-[#8B93A1]">···</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="py-10 text-center text-sm text-[#8B93A1]">2 筆邀請中的使用者</p>
      )}
    </OrgSettingsShell>
  );
}
