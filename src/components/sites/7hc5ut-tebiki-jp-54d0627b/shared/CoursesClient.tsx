"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "./EmptyState";
import { FolderIcon, PlusIcon } from "./icons";
import { cn } from "@/lib/utils";
import type { TebikiCourse, TebikiCourseFolder } from "@/types/tebiki";

export function CoursesClient({
  folders,
  courses,
}: {
  folders: TebikiCourseFolder[];
  courses: TebikiCourse[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"folders" | "courses">("folders");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const tabs = [
    { key: "folders" as const, label: `資料夾 (${folders.length})` },
    { key: "courses" as const, label: `課程 (${courses.length})` },
  ];

  async function handleAdd() {
    if (!name.trim()) return;
    const endpoint = tab === "folders" ? "/api/course-folders" : "/api/courses";
    const body = tab === "folders" ? { name: name.trim() } : { title: name.trim() };
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setName("");
    setAdding(false);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">課程</h1>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          <PlusIcon className="h-4 w-4" />
          {tab === "folders" ? "新增資料夾" : "新增課程"}
        </button>
      </div>

      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="flex gap-6 border-b border-tebiki-border px-6 pt-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setAdding(false);
              }}
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

        {adding && (
          <div className="flex items-center gap-2 border-b border-tebiki-border px-6 py-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={tab === "folders" ? "資料夾名稱" : "課程名稱"}
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

        {tab === "folders" &&
          (folders.length === 0 ? (
            <EmptyState title="未找到資料夾" description="此資料夾尚無任何子資料夾。" />
          ) : (
            <ul className="divide-y divide-tebiki-border">
              {folders.map((f) => (
                <li key={f.id} className="flex items-center gap-2 px-6 py-3 text-sm text-[#2B2C2F]">
                  <FolderIcon className="h-4 w-4 text-[#8B93A1]" />
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
                <li key={c.id} className="px-6 py-3 text-sm">
                  <Link href={`/courses/${c.id}`} className="text-brand hover:underline">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </>
  );
}
