import Link from "next/link";
import { DashboardShell, EmptyState } from "./DashboardShell";
import { FolderManager } from "./FolderManager";
import { SearchIcon, SortIcon } from "./icons";
import { getManuals, type ManualStatus } from "@/lib/queries/manuals";
import { getFolders } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";

export async function ManualListPage({
  breadcrumbLabel,
  status,
  searchParams,
}: {
  breadcrumbLabel: string;
  status: ManualStatus;
  searchParams?: Promise<{ q?: string; sort?: string; folderId?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const keyword = resolved?.q?.trim();
  const order = resolved?.sort === "asc" ? "asc" : "desc";
  const folderIdParam = resolved?.folderId;
  const folderId =
    folderIdParam === undefined
      ? undefined
      : folderIdParam === "none"
        ? null
        : /^\d+$/.test(folderIdParam)
          ? Number(folderIdParam)
          : undefined;

  const { role } = await getCurrentUser();
  const canManageFolders = isEditorOrAbove(role);

  const [manuals, folders] = await Promise.all([
    getManuals(CURRENT_ORG_ID, status, keyword, order, folderId),
    getFolders(CURRENT_ORG_ID),
  ]);

  const nextSortHref = `?${new URLSearchParams({
    ...(keyword ? { q: keyword } : {}),
    ...(folderIdParam ? { folderId: folderIdParam } : {}),
    sort: order === "asc" ? "desc" : "asc",
  }).toString()}`;

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", breadcrumbLabel]}>
      {canManageFolders && <FolderManager folders={folders} canDelete={isAdmin(role)} />}

      <div className="rounded-xl border border-tebiki-border bg-white">
        <form method="get" className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="grid flex-1 grid-cols-3 gap-6">
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
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">資料夾</p>
              <select
                name="folderId"
                defaultValue={folderIdParam ?? ""}
                className="w-full rounded-lg border border-tebiki-border bg-white px-3 py-2 text-sm"
              >
                <option value="">所有資料夾</option>
                <option value="none">未分類</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#8B93A1]">最後更新者</p>
            </div>
          </div>
          <Link
            href={nextSortHref}
            className="flex shrink-0 items-center gap-1.5 text-sm text-[#5B6270] hover:text-brand"
          >
            <SortIcon className="h-4 w-4" />
            {order === "desc" ? "最新" : "最舊"}
          </Link>
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
                  <td className="px-6 py-3">
                    <Link href={`/manuals/${m.id}/edit`} className="text-brand hover:underline">
                      {m.title}
                    </Link>
                  </td>
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
