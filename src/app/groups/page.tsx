import { OrgSettingsShell } from "@/components/sites/training-platform/shared/OrgSettingsShell";
import { GroupsClient } from "@/components/sites/training-platform/shared/GroupsClient";
import { getAllGroupMemberIds, getUserGroups } from "@/lib/queries/groups";
import { getOrgUsers } from "@/lib/queries/users";
import { CURRENT_ORG_ID, requireAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  await requireAdmin();
  const [groups, orgUsers] = await Promise.all([
    getUserGroups(CURRENT_ORG_ID),
    getOrgUsers(CURRENT_ORG_ID),
  ]);
  const groupsWithMembers = await Promise.all(
    groups.map(async (g) => ({
      ...g,
      memberIds: (await getAllGroupMemberIds(Number(g.id))).map(String),
    }))
  );

  return (
    <OrgSettingsShell active="使用者群組" breadcrumbExtra="使用者群組">
      <GroupsClient groups={groupsWithMembers} allUsers={orgUsers.members} />
    </OrgSettingsShell>
  );
}
