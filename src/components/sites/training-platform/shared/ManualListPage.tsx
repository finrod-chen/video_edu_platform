import Link from "next/link";
import { DashboardShell, EmptyState } from "./DashboardShell";
import { FolderManager } from "./FolderManager";
import { SortIcon } from "./icons";
import { getManuals, type ManualStatus } from "@/lib/queries/manuals";
import { getFolders } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";

const BASE_PATH_BY_STATUS: Record<ManualStatus, string> = {
  published: "/manuals",
  draft: "/drafts",
  trashed: "/trashes",
};

export async function ManualListPage({
  breadcrumbLabel,
  status,
  searchParams,
}: {
  breadcrumbLabel: string;
  status: ManualStatus;
  searchParams?: Promise<{ sort?: string; folderId?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
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
  const basePath = BASE_PATH_BY_STATUS[status];

  const [manuals, folders] = await Promise.all([
    getManuals(CURRENT_ORG_ID, status, undefined, order, folderId),
    getFolders(CURRENT_ORG_ID),
  ]);

  const nextSortHref = `?${new URLSearchParams({
    ...(folderIdParam ? { folderId: folderIdParam } : {}),
    sort: order === "asc" ? "desc" : "asc",
  }).toString()}`;

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", breadcrumbLabel]}>
      {canManageFolders && (
        <FolderManager
          folders={folders}
          canDelete={isAdmin(role)}
          basePath={basePath}
          selectedFolderId={folderIdParam}
        />
      )}

      <div className="rounded-xl border border-app-border bg-white">
        <div className="flex items-center justify-end px-6 py-4">
          <Link
            href={nextSortHref}
            className="flex shrink-0 items-center gap-1.5 text-sm text-[#5B6270] hover:text-brand"
          >
            <SortIcon className="h-4 w-4" />
            {order === "desc" ? "最新" : "最舊"}
          </Link>
        </div>

        {manuals.length === 0 ? (
          <EmptyState title="沒有數據" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-app-border text-left text-[#8B93A1]">
                <th className="px-6 py-3 font-medium">標題</th>
                <th className="px-6 py-3 font-medium">標籤</th>
                <th className="px-6 py-3 font-medium">最後更新者</th>
                <th className="px-6 py-3 font-medium">更新時間</th>
              </tr>
            </thead>
            <tbody>
              {manuals.map((m) => (
                <tr key={m.id} className="border-t border-app-border">
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
