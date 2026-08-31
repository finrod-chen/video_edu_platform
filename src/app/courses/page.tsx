import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { CoursesClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/CoursesClient";
import { getCourseFolders, getCourses } from "@/lib/queries/courses";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [folders, courses] = await Promise.all([
    getCourseFolders(CURRENT_ORG_ID),
    getCourses(CURRENT_ORG_ID),
  ]);

  return (
    <DashboardShell activeKey="courses" breadcrumb={["首頁", "課程"]}>
      <CoursesClient folders={folders} courses={courses} />
    </DashboardShell>
  );
}
