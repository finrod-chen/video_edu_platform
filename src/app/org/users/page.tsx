import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";
import { OrgUsersClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgUsersClient";
import { getOrgUsers } from "@/lib/queries/users";
import { CURRENT_ORG_ID, requireAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function OrgUsersPage() {
  const { id: currentUserId } = await requireAdmin();
  const { members, memberCount } = await getOrgUsers(CURRENT_ORG_ID);

  return (
    <OrgSettingsShell active="使用者管理" breadcrumbExtra="使用者管理">
      <OrgUsersClient members={members} memberCount={memberCount} currentUserId={String(currentUserId)} />
    </OrgSettingsShell>
  );
}
