"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "./EmptyState";
import { PlusIcon } from "./icons";
import type { ManualStatus, TebikiCourse } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export function CoursesClient({
  courses,
  canManage,
}: {
  courses: TebikiCourse[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  async function handleAdd() {
    if (!name.trim()) return;
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name.trim() }),
    });
    const { id } = await res.json();
    setName("");
    setAdding(false);
    router.push(`/courses/${id}`);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">課程</h1>
        {canManage && (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            <PlusIcon className="h-4 w-4" />
            新增課程
          </button>
        )}
      </div>

      <div className="rounded-xl border border-tebiki-border bg-white">
        {adding && (
          <div className="flex items-center gap-2 border-b border-tebiki-border px-6 py-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="課程名稱"
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

        {courses.length === 0 ? (
          <EmptyState title="沒有數據" />
        ) : (
          <ul className="divide-y divide-tebiki-border">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-6 py-3 text-sm">
                <Link href={`/courses/${c.id}`} className="flex-1 text-brand hover:underline">
                  {c.title}
                </Link>
                {canManage && c.status && (
                  <span className="rounded-full bg-tebiki-bg px-3 py-1 text-xs font-medium text-[#5B6270]">
                    {STATUS_LABEL[c.status]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
