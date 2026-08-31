"use client";

import { useState } from "react";
import { DashboardShell, EmptyState } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { cn } from "@/lib/utils";
import { FolderIcon, SupportIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";

const tabs = [
  { key: "folders", label: "資料夾 (0)" },
  { key: "courses", label: "課程 (0)" },
  { key: "manual", label: "手動的 (3)" },
] as const;

export default function CoursesPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("folders");

  return (
    <DashboardShell activeKey="courses" breadcrumb={["首頁", "課程"]}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[#2B2C2F]">
          課程
          <a href="https://help.tebiki.jp" target="_blank" rel="noreferrer" className="text-[#8B93A1]">
            <SupportIcon className="h-4 w-4" />
          </a>
        </h1>
        <button className="text-sm font-medium text-tebiki-blue hover:underline">編輯課程規劃</button>
      </div>

      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="flex gap-6 border-b border-tebiki-border px-6 pt-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-1 pb-3 text-sm transition-colors",
                tab === t.key
                  ? "border-tebiki-blue font-medium text-tebiki-blue"
                  : "border-transparent text-[#5B6270] hover:text-[#2B2C2F]"
              )}
            >
              {t.key === "folders" && <FolderIcon className="h-4 w-4" />}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "folders" && <EmptyState title="未找到資料夾" description="此資料夾尚無任何子資料夾。" />}
        {tab === "courses" && <EmptyState title="沒有數據" />}
        {tab === "manual" && <EmptyState title="沒有數據" />}
      </div>
    </DashboardShell>
  );
}
