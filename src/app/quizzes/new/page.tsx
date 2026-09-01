import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { NewQuizForm } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/quizzes/NewQuizForm";
import { getManuals } from "@/lib/queries/manuals";
import { getCourses } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function NewQuizPage() {
  await requireEditor();

  const [manuals, courses] = await Promise.all([
    getManuals(CURRENT_ORG_ID, "published"),
    getCourses(CURRENT_ORG_ID, ["published"]),
  ]);

  return (
    <DashboardShell activeKey="quizzes" breadcrumb={["首頁", "測驗管理", "新增"]}>
      <h1 className="mb-6 text-xl font-bold text-[#2B2C2F]">新增測驗</h1>
      <div className="rounded-xl border border-tebiki-border bg-white p-6">
        <NewQuizForm manuals={manuals} courses={courses} />
      </div>
    </DashboardShell>
  );
}
