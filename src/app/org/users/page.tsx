import { OrgSettingsShell } from "@/components/sites/training-platform/shared/OrgSettingsShell";
import { OrgUsersClient } from "@/components/sites/training-platform/shared/OrgUsersClient";
import { getOrgUsersForManagement } from "@/lib/queries/users";
import { CURRENT_ORG_ID, requireAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function OrgUsersPage() {
  const { id: currentUserId } = await requireAdmin();
  const members = await getOrgUsersForManagement(CURRENT_ORG_ID);

  return (
    <OrgSettingsShell active="使用者管理" breadcrumbExtra="使用者管理">
      <OrgUsersClient
        members={members}
        memberCount={members.filter((m) => m.status === "active").length}
        currentUserId={String(currentUserId)}
      />
    </OrgSettingsShell>
  );
}
