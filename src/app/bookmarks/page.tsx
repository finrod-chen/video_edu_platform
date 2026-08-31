"use client";

import { useState } from "react";
import { DashboardShell, EmptyState } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const [tab, setTab] = useState<"manuals" | "courses">("manuals");

  return (
    <DashboardShell activeKey="bookmarks" breadcrumb={["書籤"]}>
      <h1 className="mb-4 text-xl font-bold text-[#2B2C2F]">書籤</h1>
      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="flex gap-6 border-b border-tebiki-border px-6 pt-4">
          {[
            { key: "manuals" as const, label: "手冊(0)" },
            { key: "courses" as const, label: "課程(0)" },
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
        <EmptyState title="沒有數據" />
      </div>
    </DashboardShell>
  );
}
