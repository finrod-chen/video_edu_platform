"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { User } from "@/types/models";

const tabs = [
  { key: "profile", label: "個人資料" },
  { key: "email", label: "電子郵件通知" },
] as const;

export function MyPageClient({ user }: { user: User }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("profile");
  const [enabled, setEnabled] = useState(user.emailNotificationsEnabled);
  const [saving, setSaving] = useState(false);

  const fields = [
    { label: "姓名", value: user.name },
    { label: "電子郵件", value: user.email },
    { label: "使用者角色", value: user.role },
  ];

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    try {
      await fetch("/api/users/me/email-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-app-border bg-white">
      <div className="flex gap-6 border-b border-app-border px-6 pt-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm transition-colors",
              tab === t.key
                ? "border-brand font-medium text-brand"
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
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatarInitial}
            </div>
            <div className="divide-y divide-app-border">
              {fields.map((f) => (
                <div key={f.label} className="py-4 first:pt-0">
                  <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{f.label}</p>
                  <p className="text-sm text-[#5B6270]">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "email" && (
          <div className="flex items-center justify-between max-w-md">
            <div>
              <p className="text-sm font-bold text-[#2B2C2F]">指派到期提醒</p>
              <p className="mt-1 text-sm text-[#8B93A1]">有新的手冊/課程指派給您時，寄送 email 通知。</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={saving}
              onClick={handleToggle}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
                enabled ? "bg-brand" : "bg-[#D6D9E0]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  enabled ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
