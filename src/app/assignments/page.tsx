import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { AssignmentsClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/AssignmentsClient";
import { getAssignmentsForOrg } from "@/lib/queries/assignments";
import { getManuals } from "@/lib/queries/manuals";
import { getOrgUsers } from "@/lib/queries/users";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  await requireEditor();

  const [assignments, manuals, orgUsers] = await Promise.all([
    getAssignmentsForOrg(CURRENT_ORG_ID),
    getManuals(CURRENT_ORG_ID, "published"),
    getOrgUsers(CURRENT_ORG_ID),
  ]);

  return (
    <DashboardShell activeKey="assignments" breadcrumb={["首頁", "指派管理"]}>
      <AssignmentsClient assignments={assignments} manuals={manuals} employees={orgUsers.members} />
    </DashboardShell>
  );
}
