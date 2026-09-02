import Link from "next/link";
import { mockUser } from "./mock-data";
import { HeaderSearch } from "./HeaderSearch";
import { LogOutIcon } from "./icons";
import { getUser } from "@/lib/queries/users";
import { getCurrentUserId } from "@/lib/current-viewer";
import { signOut } from "@/auth";

export async function Topbar({ breadcrumb }: { breadcrumb: string[] }) {
  // Falls back to the mock identity if the DB is unreachable (e.g. at
  // build time, before a Docker image's runtime .env is mounted) so a
  // transient DB issue never takes down page rendering just for the avatar.
  const user =
    (await getCurrentUserId()
      .then((id) => getUser(id))
      .catch(() => null)) ?? mockUser;
  return (
    <header className="flex h-14 items-center justify-between border-b border-app-border bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-[#5B6270]">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#C4CAD4]">›</span>}
            {crumb}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <HeaderSearch />

        <Link
          href="/mypage"
          aria-label="帳戶設定"
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.avatarInitial}
        </Link>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            aria-label="登出"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5B6270] hover:bg-app-bg"
          >
            <LogOutIcon className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </header>
  );
}
