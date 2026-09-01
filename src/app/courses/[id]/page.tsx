import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { CourseDetailClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/courses/CourseDetailClient";
import { getCourseById, getCourseManuals } from "@/lib/queries/courses";
import { getManuals } from "@/lib/queries/manuals";
import { getAcknowledgedManualIds } from "@/lib/queries/acknowledgments";
import { CURRENT_ORG_ID, getCurrentUser, isAdmin, isEditorOrAbove } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const courseId = Number(id);
  const [course, currentUser] = await Promise.all([
    getCourseById(CURRENT_ORG_ID, courseId),
    getCurrentUser(),
  ]);
  if (!course) notFound();

  if (course.status !== "published" && !isEditorOrAbove(currentUser.role)) {
    notFound();
  }

  const [manuals, availableManuals] = await Promise.all([
    getCourseManuals(courseId),
    getManuals(CURRENT_ORG_ID, "published"),
  ]);

  const canManage = isEditorOrAbove(currentUser.role);
  const canPermanentlyDelete =
    isAdmin(currentUser.role) || (canManage && !course.hasBeenPublished);
  const acknowledgedManualIds = await getAcknowledgedManualIds(
    currentUser.id,
    manuals.map((m) => Number(m.manualId))
  );

  return (
    <DashboardShell activeKey="courses" breadcrumb={["首頁", "課程", course.title]}>
      <h1 className="mb-4 text-xl font-bold text-[#2B2C2F]">{course.title}</h1>
      <CourseDetailClient
        course={course}
        initialManuals={manuals}
        availableManuals={availableManuals}
        canManage={canManage}
        canPermanentlyDelete={canPermanentlyDelete}
        acknowledgedManualIds={[...acknowledgedManualIds]}
      />
    </DashboardShell>
  );
}
