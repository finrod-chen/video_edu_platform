"use client";

import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface BookmarkedItem {
  id: string;
  title: string;
}

export function BookmarksClient({
  manuals,
  courses,
}: {
  manuals: BookmarkedItem[];
  courses: BookmarkedItem[];
}) {
  const [tab, setTab] = useState<"manuals" | "courses">("manuals");
  const items = tab === "manuals" ? manuals : courses;

  return (
    <div className="rounded-xl border border-tebiki-border bg-white">
      <div className="flex gap-6 border-b border-tebiki-border px-6 pt-4">
        {[
          { key: "manuals" as const, label: `手冊(${manuals.length})` },
          { key: "courses" as const, label: `課程(${courses.length})` },
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
      {items.length === 0 ? (
        <EmptyState title="沒有數據" />
      ) : (
        <ul className="divide-y divide-tebiki-border">
          {items.map((item) => (
            <li key={item.id} className="px-6 py-3 text-sm text-[#2B2C2F]">
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
