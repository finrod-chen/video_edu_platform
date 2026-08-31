"use client";

import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { FolderIcon, SupportIcon } from "./icons";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  name?: string;
  title?: string;
}

export function CoursesClient({
  folders,
  courses,
}: {
  folders: Item[];
  courses: Item[];
}) {
  const [tab, setTab] = useState<"folders" | "courses" | "manual">("folders");

  const tabs = [
    { key: "folders" as const, label: `資料夾 (${folders.length})` },
    { key: "courses" as const, label: `課程 (${courses.length})` },
    { key: "manual" as const, label: "手動的 (3)" },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[#2B2C2F]">
          課程
          <a href="#" target="_blank" rel="noreferrer" className="text-[#8B93A1]">
            <SupportIcon className="h-4 w-4" />
          </a>
        </h1>
        <button className="text-sm font-medium text-brand hover:underline">編輯課程規劃</button>
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
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-[#5B6270] hover:text-[#2B2C2F]"
              )}
            >
              {t.key === "folders" && <FolderIcon className="h-4 w-4" />}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "folders" &&
          (folders.length === 0 ? (
            <EmptyState title="未找到資料夾" description="此資料夾尚無任何子資料夾。" />
          ) : (
            <ul className="divide-y divide-tebiki-border">
              {folders.map((f) => (
                <li key={f.id} className="px-6 py-3 text-sm text-[#2B2C2F]">
                  {f.name}
                </li>
              ))}
            </ul>
          ))}
        {tab === "courses" &&
          (courses.length === 0 ? (
            <EmptyState title="沒有數據" />
          ) : (
            <ul className="divide-y divide-tebiki-border">
              {courses.map((c) => (
                <li key={c.id} className="px-6 py-3 text-sm text-[#2B2C2F]">
                  {c.title}
                </li>
              ))}
            </ul>
          ))}
        {tab === "manual" && <EmptyState title="沒有數據" />}
      </div>
    </>
  );
}
