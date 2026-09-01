import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { CourseDetailClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/courses/CourseDetailClient";
import { getCourseById, getCourseManuals } from "@/lib/queries/courses";
import { getManuals } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const courseId = Number(id);
  const course = await getCourseById(CURRENT_ORG_ID, courseId);
  if (!course) notFound();

  const [manuals, availableManuals] = await Promise.all([
    getCourseManuals(courseId),
    getManuals(CURRENT_ORG_ID, "published"),
  ]);

  return (
    <DashboardShell activeKey="courses" breadcrumb={["首頁", "課程", course.title]}>
      <h1 className="mb-4 text-xl font-bold text-[#2B2C2F]">{course.title}</h1>
      <CourseDetailClient course={course} initialManuals={manuals} availableManuals={availableManuals} />
    </DashboardShell>
  );
}
