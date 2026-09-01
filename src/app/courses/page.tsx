import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { CoursesClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/CoursesClient";
import { getCourses } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { role } = await getCurrentUser();
  const canManage = isEditorOrAbove(role);
  const courses = await getCourses(CURRENT_ORG_ID, canManage ? undefined : ["published"]);

  return (
    <DashboardShell activeKey="courses" breadcrumb={["首頁", "課程"]}>
      <CoursesClient courses={courses} canManage={canManage} />
    </DashboardShell>
  );
}
