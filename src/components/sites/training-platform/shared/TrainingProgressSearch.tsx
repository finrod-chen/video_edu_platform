"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchIcon } from "./icons";

interface SearchResult {
  type: "manual" | "course";
  id: string;
  title: string;
}

export function TrainingProgressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) setResults(await res.json());
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <label className="relative flex items-center">
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入手冊或課程標題"
          className="w-full rounded-lg border border-app-border py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </label>

      {query.trim() && (
        <div className="mt-2 space-y-1">
          {results.length === 0 ? (
            <p className="px-1 py-2 text-sm text-[#8B93A1]">沒有符合的結果</p>
          ) : (
            results.map((r) => (
              <Link
                key={`${r.type}-${r.id}`}
                href={r.type === "manual" ? `/manuals/${r.id}` : `/courses/${r.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-app-bg"
              >
                <span className="text-[#2B2C2F]">{r.title}</span>
                <span className="text-xs text-[#8B93A1]">{r.type === "manual" ? "手冊" : "課程"}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
