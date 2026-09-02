import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { ManualViewerClient } from "@/components/sites/training-platform/manuals/ManualViewerClient";
import { getManualById, getManualSteps } from "@/lib/queries/manuals";
import { getAcknowledgedStepIds, isLastStepAcknowledged } from "@/lib/queries/acknowledgments";
import { getLatestAttempt, getPublishedQuizForManual } from "@/lib/queries/quizzes";
import { listManualAttachments } from "@/lib/queries/attachments";
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
  const [manual, steps, quiz, attachments] = await Promise.all([
    getManualById(CURRENT_ORG_ID, manualId),
    getManualSteps(manualId),
    getPublishedQuizForManual(CURRENT_ORG_ID, manualId),
    listManualAttachments(manualId),
  ]);

  if (!manual) notFound();

  const [acknowledgedStepIds, quizUnlocked, latestAttempt] = await Promise.all([
    getAcknowledgedStepIds(currentUser.id, steps.map((s) => Number(s.id))),
    isLastStepAcknowledged(manualId, currentUser.id),
    quiz ? getLatestAttempt(Number(quiz.id), currentUser.id) : Promise.resolve(null),
  ]);

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
      <ManualViewerClient
        manual={manual}
        steps={steps}
        initialAcknowledgedStepIds={[...acknowledgedStepIds]}
        quiz={quiz}
        quizUnlocked={quizUnlocked}
        latestAttempt={latestAttempt}
        attachments={attachments}
      />
    </DashboardShell>
  );
}
