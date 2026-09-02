import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { NewManualForm } from "@/components/sites/training-platform/manuals/NewManualForm";
import { getFolders } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function NewManualPage() {
  await requireEditor();
  const folders = await getFolders(CURRENT_ORG_ID);
  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", "新增"]}>
      <h1 className="mb-6 text-xl font-bold text-[#2B2C2F]">新增手冊</h1>
      <div className="rounded-xl border border-app-border bg-white p-6">
        <NewManualForm folders={folders} />
      </div>
    </DashboardShell>
  );
}
