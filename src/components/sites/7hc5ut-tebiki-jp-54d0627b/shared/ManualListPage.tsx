import { DashboardShell, EmptyState } from "./DashboardShell";
import { SearchIcon, SortIcon } from "./icons";
import { getManuals, type ManualStatus } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export async function ManualListPage({
  breadcrumbLabel,
  status,
  searchParams,
}: {
  breadcrumbLabel: string;
  status: ManualStatus;
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const keyword = resolved?.q?.trim();
  const manuals = await getManuals(CURRENT_ORG_ID, status, keyword);

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", breadcrumbLabel]}>
      <div className="rounded-xl border border-tebiki-border bg-white">
        <form method="get" className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="grid flex-1 grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">關鍵字</p>
              <label className="relative flex items-center">
                <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
                <input
                  type="search"
                  name="q"
                  defaultValue={keyword}
                  placeholder="按關鍵字搜尋"
                  className="w-full rounded-lg border border-tebiki-border bg-white py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </label>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">最後更新者</p>
            </div>
          </div>
          <button type="button" className="flex shrink-0 items-center gap-1.5 text-sm text-[#5B6270] hover:text-brand">
            <SortIcon className="h-4 w-4" />
            最新
          </button>
        </form>

        {manuals.length === 0 ? (
          <EmptyState title="沒有數據" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-tebiki-border text-left text-[#8B93A1]">
                <th className="px-6 py-3 font-medium">標題</th>
                <th className="px-6 py-3 font-medium">標籤</th>
                <th className="px-6 py-3 font-medium">最後更新者</th>
                <th className="px-6 py-3 font-medium">更新時間</th>
              </tr>
            </thead>
            <tbody>
              {manuals.map((m) => (
                <tr key={m.id} className="border-t border-tebiki-border">
                  <td className="px-6 py-3 text-brand">{m.title}</td>
                  <td className="px-6 py-3 text-[#5B6270]">{m.tags.join("、") || "—"}</td>
                  <td className="px-6 py-3 text-[#5B6270]">{m.updatedBy}</td>
                  <td className="px-6 py-3 text-[#8B93A1]">{m.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
