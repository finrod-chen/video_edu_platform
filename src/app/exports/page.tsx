import { OrgSettingsShell } from "@/components/sites/training-platform/shared/OrgSettingsShell";
import { SearchIcon } from "@/components/sites/training-platform/shared/icons";
import { requireAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  await requireAdmin();
  return (
    <OrgSettingsShell active="下載" breadcrumbExtra="下載">
      <div className="mb-6 border-b border-app-border pb-3">
        <span className="border-b-2 border-brand pb-3 text-sm font-medium text-brand">視訊檔案</span>
      </div>
      <p className="mb-1 text-sm text-[#5B6270]">您可以下載已上傳的影片檔案。</p>
      <p className="mb-6 text-sm text-[#5B6270]">不包括在系統中所做的編輯，例如插入、字幕、圖形、剪切、定格、旋轉和畫外音。</p>

      <label className="relative mb-6 flex max-w-md items-center">
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
        <input
          type="search"
          placeholder="透過影片手冊 URL 搜尋"
          className="w-full rounded-lg border border-app-border py-2 pl-9 pr-3 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </label>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-app-border text-left text-[#8B93A1]">
            <th className="py-3 font-medium">標題</th>
            <th className="py-3 font-medium">上傳日期</th>
            <th className="py-3 font-medium">操作</th>
          </tr>
        </thead>
      </table>
    </OrgSettingsShell>
  );
}
