"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

interface SearchResult {
  type: "manual" | "course";
  id: string;
  title: string;
}

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        setResults(await res.json());
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.type === "manual" ? `/manuals/${result.id}` : `/courses/${result.id}`);
  }

  const manuals = results.filter((r) => r.type === "manual");
  const courses = results.filter((r) => r.type === "course");

  return (
    <div ref={containerRef} className="relative">
      <label className="relative flex items-center">
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="搜尋系統內容"
          className="w-64 rounded-lg border-0 bg-[#F5F6F8] py-2 pl-9 pr-3 text-sm text-[#2B2C2F] placeholder:text-[#8B93A1] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </label>

      {open && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-app-border bg-white p-2 shadow-lg">
          {results.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[#8B93A1]">沒有符合的結果</p>
          ) : (
            <>
              {manuals.length > 0 && (
                <div className="mb-1">
                  <p className="px-2 py-1 text-xs font-medium text-[#8B93A1]">手冊</p>
                  {manuals.map((r) => (
                    <button
                      key={`manual-${r.id}`}
                      type="button"
                      onClick={() => handleSelect(r)}
                      className="block w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-[#2B2C2F] hover:bg-app-bg"
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
              {courses.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-[#8B93A1]">課程</p>
                  {courses.map((r) => (
                    <button
                      key={`course-${r.id}`}
                      type="button"
                      onClick={() => handleSelect(r)}
                      className="block w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-[#2B2C2F] hover:bg-app-bg"
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
