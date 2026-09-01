import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { QuizEditorClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/quizzes/QuizEditorClient";
import { getQuizById, getQuizQuestions } from "@/lib/queries/quizzes";
import { getManuals } from "@/lib/queries/manuals";
import { getCourses } from "@/lib/queries/courses";
import { CURRENT_ORG_ID, isAdmin, isEditorOrAbove, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function QuizEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const currentUser = await requireEditor();
  const quizId = Number(id);
  const [quiz, questions] = await Promise.all([
    getQuizById(CURRENT_ORG_ID, quizId),
    getQuizQuestions(quizId),
  ]);
  if (!quiz) notFound();

  const [publishedManuals, draftManuals, trashedManuals, courses] = await Promise.all([
    getManuals(CURRENT_ORG_ID, "published"),
    getManuals(CURRENT_ORG_ID, "draft"),
    getManuals(CURRENT_ORG_ID, "trashed"),
    getCourses(CURRENT_ORG_ID),
  ]);
  const targetTitle =
    quiz.scope === "manual"
      ? [...publishedManuals, ...draftManuals, ...trashedManuals].find((m) => m.id === quiz.manualId)?.title ?? "—"
      : courses.find((c) => c.id === quiz.courseId)?.title ?? "—";

  const canPermanentlyDelete =
    isAdmin(currentUser.role) || (isEditorOrAbove(currentUser.role) && !quiz.hasBeenPublished);

  return (
    <DashboardShell activeKey="quizzes" breadcrumb={["首頁", "測驗管理", quiz.title]}>
      <QuizEditorClient
        quiz={quiz}
        targetTitle={targetTitle}
        initialQuestions={questions}
        canPermanentlyDelete={canPermanentlyDelete}
      />
    </DashboardShell>
  );
}
