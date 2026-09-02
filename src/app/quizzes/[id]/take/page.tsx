import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { QuizTakeClient } from "@/components/sites/training-platform/quizzes/QuizTakeClient";
import { getLatestAttempt, getQuizById, getQuizQuestions } from "@/lib/queries/quizzes";
import { CURRENT_ORG_ID, getCurrentUser } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const quizId = Number(id);
  const { id: userId } = await getCurrentUser();
  const quiz = await getQuizById(CURRENT_ORG_ID, quizId);
  if (!quiz || quiz.status !== "published") notFound();

  const [rawQuestions, lastAttempt] = await Promise.all([
    getQuizQuestions(quizId),
    getLatestAttempt(quizId, userId),
  ]);

  // Never send is_correct to the employee taking the quiz.
  const questions = rawQuestions.map((q) => ({
    ...q,
    choices: q.choices.map(({ id: choiceId, label }) => ({ id: choiceId, label })),
  }));

  return (
    <DashboardShell activeKey="quizzes" breadcrumb={["首頁", "測驗", quiz.title]}>
      <h1 className="mb-4 text-xl font-bold text-[#2B2C2F]">{quiz.title}</h1>
      <QuizTakeClient quiz={quiz} questions={questions} lastAttempt={lastAttempt} />
    </DashboardShell>
  );
}
