import Link from "next/link";
import { mockUser } from "./mock-data";
import {
  BellIcon,
  LinkIcon,
  SearchIcon,
  TaskIcon,
  TranslateIcon,
} from "./icons";
import { getUser } from "@/lib/queries/users";
import { CURRENT_USER_ID } from "@/lib/current-viewer";

export async function Topbar({ breadcrumb }: { breadcrumb: string[] }) {
  // Falls back to the mock identity if the DB is unreachable (e.g. at
  // build time, before a Docker image's runtime .env is mounted) so a
  // transient DB issue never takes down page rendering just for the avatar.
  const user = (await getUser(CURRENT_USER_ID).catch(() => null)) ?? mockUser;
  return (
    <header className="flex h-14 items-center justify-between border-b border-tebiki-border bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-[#5B6270]">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#C4CAD4]">›</span>}
            {crumb}
          </span>
        ))}
        <button
          type="button"
          aria-label="複製連結"
          className="ml-1 rounded p-1 text-[#8B93A1] hover:bg-tebiki-bg"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="翻譯"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand hover:bg-brand/20"
        >
          <TranslateIcon className="h-4 w-4" />
        </button>

        <label className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
          <input
            type="search"
            placeholder="搜尋系統內容"
            className="w-64 rounded-lg border-0 bg-[#F5F6F8] py-2 pl-9 pr-3 text-sm text-[#2B2C2F] placeholder:text-[#8B93A1] focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </label>

        <button
          type="button"
          aria-label="任務"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5B6270] hover:bg-tebiki-bg"
        >
          <TaskIcon className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          aria-label="通知"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5B6270] hover:bg-tebiki-bg"
        >
          <BellIcon className="h-[18px] w-[18px]" />
        </button>

        <Link
          href="/mypage"
          aria-label="帳戶設定"
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.avatarInitial}
        </Link>
      </div>
    </header>
  );
}
