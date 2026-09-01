import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { ManualEditorClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/manuals/ManualEditorClient";
import { getManualById, getManualSteps } from "@/lib/queries/manuals";
import { getTagsForManual } from "@/lib/queries/tags";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function ManualEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const manualId = Number(id);
  const [manual, steps, tags, currentUser] = await Promise.all([
    getManualById(CURRENT_ORG_ID, manualId),
    getManualSteps(manualId),
    getTagsForManual(manualId),
    getCurrentUser(),
  ]);

  if (!manual) notFound();

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", manual.title]}>
      <ManualEditorClient
        manual={manual}
        initialSteps={steps}
        initialTags={tags}
        isAdmin={isAdmin(currentUser.role)}
      />
    </DashboardShell>
  );
}
