import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { ManualEditorClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/manuals/ManualEditorClient";
import { getManualById, getManualSteps } from "@/lib/queries/manuals";
import { getTagsForManual } from "@/lib/queries/tags";
import { getFolders } from "@/lib/queries/folders";
import { CURRENT_ORG_ID, isAdmin, isEditorOrAbove, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function ManualEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const currentUser = await requireEditor();
  const manualId = Number(id);
  const [manual, steps, tags, folders] = await Promise.all([
    getManualById(CURRENT_ORG_ID, manualId),
    getManualSteps(manualId),
    getTagsForManual(manualId),
    getFolders(CURRENT_ORG_ID),
  ]);

  if (!manual) notFound();

  const canPermanentlyDelete =
    isAdmin(currentUser.role) || (isEditorOrAbove(currentUser.role) && !manual.hasBeenPublished);

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", manual.title]}>
      <ManualEditorClient
        manual={manual}
        initialSteps={steps}
        initialTags={tags}
        folders={folders}
        canPermanentlyDelete={canPermanentlyDelete}
      />
    </DashboardShell>
  );
}
