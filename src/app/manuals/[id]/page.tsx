import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { ManualViewerClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/manuals/ManualViewerClient";
import { getManualById, getManualSteps } from "@/lib/queries/manuals";
import { getAcknowledgment } from "@/lib/queries/acknowledgments";
import { getLatestAttempt, getPublishedQuizForManual } from "@/lib/queries/quizzes";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function ManualViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const manualId = Number(id);
  const currentUser = await getCurrentUser();
  const [manual, steps, acknowledged, quiz] = await Promise.all([
    getManualById(CURRENT_ORG_ID, manualId),
    getManualSteps(manualId),
    getAcknowledgment(manualId, currentUser.id),
    getPublishedQuizForManual(CURRENT_ORG_ID, manualId),
  ]);

  if (!manual) notFound();

  const latestAttempt = quiz ? await getLatestAttempt(Number(quiz.id), currentUser.id) : null;

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", manual.title]}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">{manual.title}</h1>
        {isEditorOrAbove(currentUser.role) && (
          <Link href={`/manuals/${manual.id}/edit`} className="text-sm text-brand hover:underline">
            編輯手冊
          </Link>
        )}
      </div>
      {manual.description && <p className="mb-4 text-sm text-[#5B6270]">{manual.description}</p>}
      <ManualViewerClient manual={manual} steps={steps} initialAcknowledged={acknowledged} />
      {quiz && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-tebiki-border bg-white p-4">
          <p className="text-sm text-[#5B6270]">
            {latestAttempt
              ? `上次測驗結果：${latestAttempt.score}分（${latestAttempt.passed ? "已通過" : "未通過"}）`
              : "本手冊有單元測驗，完成學習後可以前往作答。"}
          </p>
          <Link
            href={`/quizzes/${quiz.id}/take`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            前往測驗
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
