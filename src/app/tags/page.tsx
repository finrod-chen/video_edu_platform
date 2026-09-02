import { DashboardShell, EmptyState } from "@/components/sites/training-platform/shared/DashboardShell";
import { PlusIcon, SearchIcon, SortIcon } from "@/components/sites/training-platform/shared/icons";
import { getTags } from "@/lib/queries/tags";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await getTags(CURRENT_ORG_ID);

  return (
    <DashboardShell activeKey="tags" breadcrumb={["首頁", "標籤"]}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">標籤</h1>
        <button className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark">
          <PlusIcon className="h-4 w-4" />
          新標籤
        </button>
      </div>

      <div className="rounded-xl border border-app-border bg-white">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="mb-1 text-xs font-medium text-[#8B93A1]">搜尋標籤</p>
            <label className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
              <input
                type="search"
                placeholder="標籤名稱"
                className="w-72 rounded-lg border border-app-border bg-white py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </label>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-[#5B6270] hover:text-brand">
            <SortIcon className="h-4 w-4" />
            標籤名稱：A 到 Z
          </button>
        </div>

        <table className="w-full border-t border-app-border text-sm">
          <thead>
            <tr className="text-left text-[#8B93A1]">
              <th className="px-6 py-3 font-medium">標籤名稱</th>
              <th className="px-6 py-3 font-medium">手冊數量</th>
              <th className="px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          {tags.length > 0 && (
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-t border-app-border">
                  <td className="px-6 py-3 text-[#2B2C2F]">{tag.name}</td>
                  <td className="px-6 py-3 text-[#5B6270]">{tag.manualCount}</td>
                  <td className="px-6 py-3 text-[#8B93A1]">···</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {tags.length === 0 && <EmptyState title="沒有數據" />}
      </div>
    </DashboardShell>
  );
}
