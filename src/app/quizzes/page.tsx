import Link from "next/link";
import { DashboardShell, EmptyState } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { PlusIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { getQuizzes } from "@/lib/queries/quizzes";
import { getManuals } from "@/lib/queries/manuals";
import { getCourses } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";
import type { ManualStatus } from "@/types/tebiki";

const STATUS_LABEL: Record<ManualStatus, string> = {
  draft: "草稿",
  published: "已發布",
  trashed: "垃圾桶",
};

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  await requireEditor();

  const [quizzes, publishedManuals, draftManuals, trashedManuals, allCourses] = await Promise.all([
    getQuizzes(CURRENT_ORG_ID),
    getManuals(CURRENT_ORG_ID, "published"),
    getManuals(CURRENT_ORG_ID, "draft"),
    getManuals(CURRENT_ORG_ID, "trashed"),
    getCourses(CURRENT_ORG_ID),
  ]);

  const manualTitleById = new Map(
    [...publishedManuals, ...draftManuals, ...trashedManuals].map((m) => [m.id, m.title])
  );
  const courseTitleById = new Map(allCourses.map((c) => [c.id, c.title]));

  return (
    <DashboardShell activeKey="quizzes" breadcrumb={["首頁", "測驗管理"]}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">測驗管理</h1>
        <Link
          href="/quizzes/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          <PlusIcon className="h-4 w-4" />
          新增測驗
        </Link>
      </div>

      <div className="rounded-xl border border-tebiki-border bg-white">
        {quizzes.length === 0 ? (
          <EmptyState title="沒有數據" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-tebiki-border text-left text-[#8B93A1]">
                <th className="px-6 py-3 font-medium">標題</th>
                <th className="px-6 py-3 font-medium">範圍</th>
                <th className="px-6 py-3 font-medium">狀態</th>
                <th className="px-6 py-3 font-medium">及格分數</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-t border-tebiki-border">
                  <td className="px-6 py-3">
                    <Link href={`/quizzes/${q.id}/edit`} className="text-brand hover:underline">
                      {q.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[#5B6270]">
                    {q.scope === "manual"
                      ? `手冊：${manualTitleById.get(q.manualId ?? "") ?? "—"}`
                      : `課程：${courseTitleById.get(q.courseId ?? "") ?? "—"}`}
                  </td>
                  <td className="px-6 py-3 text-[#5B6270]">{STATUS_LABEL[q.status]}</td>
                  <td className="px-6 py-3 text-[#8B93A1]">{q.passScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
