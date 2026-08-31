import { DashboardShell, EmptyState } from "./DashboardShell";
import { SearchIcon, SortIcon } from "./icons";

export function ManualListPage({
  breadcrumbLabel,
}: {
  breadcrumbLabel: string;
}) {
  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", breadcrumbLabel]}>
      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="grid flex-1 grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">關鍵字</p>
              <label className="relative flex items-center">
                <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
                <input
                  type="search"
                  placeholder="按關鍵字搜尋"
                  className="w-full rounded-lg border border-tebiki-border bg-white py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-tebiki-blue/40"
                />
              </label>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">最後更新者</p>
            </div>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 text-sm text-[#5B6270] hover:text-tebiki-blue">
            <SortIcon className="h-4 w-4" />
            最新
          </button>
        </div>
        <EmptyState title="沒有數據" />
      </div>
    </DashboardShell>
  );
}
