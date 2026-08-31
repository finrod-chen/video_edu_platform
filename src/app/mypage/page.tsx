"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { mockUser } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "profile", label: "輪廓" },
  { key: "email", label: "電子郵件通知" },
  { key: "password", label: "密碼" },
] as const;

const fields = [
  { label: "姓名", value: mockUser.name },
  { label: "電子郵件", value: mockUser.email },
  { label: "使用者角色", value: mockUser.role },
  { label: "顯示語言", value: "繁體中文" },
  { label: "視訊品質", value: "始終保持高品質" },
];

export default function MyPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("profile");

  return (
    <DashboardShell activeKey={null} breadcrumb={["首頁", "我的頁面", "個人資料"]}>
      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="flex gap-6 border-b border-tebiki-border px-6 pt-4">
          {tabs.map((t) => (
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

        <div className="p-6">
          {tab === "profile" && (
            <div className="grid grid-cols-[140px_1fr] gap-8">
              <div
                className="flex h-[130px] w-[130px] items-center justify-center rounded-full text-5xl font-bold text-white"
                style={{ backgroundColor: mockUser.avatarColor }}
              >
                {mockUser.avatarInitial}
              </div>
              <div>
                <div className="divide-y divide-tebiki-border">
                  {fields.map((f) => (
                    <div key={f.label} className="py-4 first:pt-0">
                      <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{f.label}</p>
                      <p className="text-sm text-[#5B6270]">{f.value}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-8 rounded-lg bg-tebiki-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-tebiki-blue-dark">
                  編輯個人資料
                </button>
              </div>
            </div>
          )}
          {tab === "email" && <p className="text-sm text-[#8B93A1]">電子郵件通知設定。</p>}
          {tab === "password" && <p className="text-sm text-[#8B93A1]">變更您的密碼。</p>}
        </div>
      </div>
    </DashboardShell>
  );
}
