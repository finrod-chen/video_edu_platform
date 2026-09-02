import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type {
  ManualStatus,
  QuizScope,
  TebikiQuiz,
  TebikiQuizAttempt,
  TebikiQuizChoice,
  TebikiQuizQuestion,
} from "@/types/tebiki";

interface QuizRow extends RowDataPacket {
  id: number;
  scope: QuizScope;
  manual_id: number | null;
  course_id: number | null;
  title: string;
  pass_score: number;
  status: ManualStatus;
  has_been_published: number | boolean;
  updated_at: string;
}

function mapQuiz(r: QuizRow): TebikiQuiz {
  return {
    id: String(r.id),
    scope: r.scope,
    manualId: r.manual_id === null ? null : String(r.manual_id),
    courseId: r.course_id === null ? null : String(r.course_id),
    title: r.title,
    passScore: r.pass_score,
    status: r.status,
    hasBeenPublished: Boolean(r.has_been_published),
    updatedAt: r.updated_at,
  };
}

const QUIZ_SELECT =
  "SELECT id, scope, manual_id, course_id, title, pass_score, status, has_been_published, updated_at FROM quizzes";

export async function getQuizzes(orgId: number): Promise<TebikiQuiz[]> {
  const [rows] = await db.query(`${QUIZ_SELECT} WHERE org_id = ? ORDER BY updated_at DESC`, [orgId]);
  return (rows as QuizRow[]).map(mapQuiz);
}

export async function getQuizById(orgId: number, quizId: number): Promise<TebikiQuiz | null> {
  const [rows] = await db.query(`${QUIZ_SELECT} WHERE id = ? AND org_id = ?`, [quizId, orgId]);
  const row = (rows as QuizRow[])[0];
  return row ? mapQuiz(row) : null;
}

export async function getPublishedQuizForManual(orgId: number, manualId: number): Promise<TebikiQuiz | null> {
  const [rows] = await db.query(
    `${QUIZ_SELECT} WHERE org_id = ? AND scope = 'manual' AND manual_id = ? AND status = 'published' LIMIT 1`,
    [orgId, manualId]
  );
  const row = (rows as QuizRow[])[0];
  return row ? mapQuiz(row) : null;
}

/** Unlike getPublishedQuizForManual, this also returns draft quizzes so the manual editor can show/link to a quiz that's still being authored. Trashed quizzes count as "no quiz bound". */
export async function getQuizForManual(orgId: number, manualId: number): Promise<TebikiQuiz | null> {
  const [rows] = await db.query(
    `${QUIZ_SELECT} WHERE org_id = ? AND scope = 'manual' AND manual_id = ? AND status != 'trashed' LIMIT 1`,
    [orgId, manualId]
  );
  const row = (rows as QuizRow[])[0];
  return row ? mapQuiz(row) : null;
}

export async function getPublishedQuizForCourse(orgId: number, courseId: number): Promise<TebikiQuiz | null> {
  const [rows] = await db.query(
    `${QUIZ_SELECT} WHERE org_id = ? AND scope = 'course' AND course_id = ? AND status = 'published' LIMIT 1`,
    [orgId, courseId]
  );
  const row = (rows as QuizRow[])[0];
  return row ? mapQuiz(row) : null;
}

export async function createQuiz(
  orgId: number,
  userId: number,
  fields: { scope: QuizScope; manualId: number | null; courseId: number | null; title: string; passScore: number }
): Promise<number> {
  const [result] = await db.execute(
    `INSERT INTO quizzes (org_id, scope, manual_id, course_id, title, pass_score, status, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
    [orgId, fields.scope, fields.manualId, fields.courseId, fields.title, fields.passScore, userId]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateQuiz(
  orgId: number,
  quizId: number,
  userId: number,
  fields: { title?: string; passScore?: number; status?: ManualStatus }
): Promise<void> {
  const sets: string[] = [];
  const params: (string | number)[] = [];
  if (fields.title !== undefined) {
    sets.push("title = ?");
    params.push(fields.title);
  }
  if (fields.passScore !== undefined) {
    sets.push("pass_score = ?");
    params.push(fields.passScore);
  }
  if (fields.status !== undefined) {
    sets.push("status = ?");
    params.push(fields.status);
    if (fields.status === "published") {
      sets.push("has_been_published = TRUE");
    }
  }
  if (sets.length === 0) return;
  sets.push("updated_by = ?");
  params.push(userId, quizId, orgId);
  await db.execute(`UPDATE quizzes SET ${sets.join(", ")} WHERE id = ? AND org_id = ?`, params);
}

export async function deleteQuiz(orgId: number, quizId: number): Promise<void> {
  await db.execute("DELETE FROM quizzes WHERE id = ? AND org_id = ?", [quizId, orgId]);
}

interface QuestionRow extends RowDataPacket {
  id: number;
  quiz_id: number;
  position: number;
  prompt: string;
}

interface ChoiceRow extends RowDataPacket {
  id: number;
  question_id: number;
  position: number;
  label: string;
  is_correct: number | boolean;
}

/** Includes `isCorrect` -- editor-only. Never pass straight through to the employee-facing take page. */
export async function getQuizQuestions(quizId: number): Promise<TebikiQuizQuestion[]> {
  const [questionRows] = await db.query(
    "SELECT id, quiz_id, position, prompt FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC",
    [quizId]
  );
  const questions = questionRows as QuestionRow[];
  if (questions.length === 0) return [];

  const [choiceRows] = await db.query(
    `SELECT id, question_id, position, label, is_correct FROM quiz_choices
     WHERE question_id IN (${questions.map(() => "?").join(",")}) ORDER BY position ASC`,
    questions.map((q) => q.id)
  );
  const choicesByQuestion = new Map<number, TebikiQuizChoice[]>();
  for (const c of choiceRows as ChoiceRow[]) {
    const list = choicesByQuestion.get(c.question_id) ?? [];
    list.push({ id: String(c.id), label: c.label, isCorrect: Boolean(c.is_correct) });
    choicesByQuestion.set(c.question_id, list);
  }

  return questions.map((q) => ({
    id: String(q.id),
    quizId: String(q.quiz_id),
    position: q.position,
    prompt: q.prompt,
    choices: choicesByQuestion.get(q.id) ?? [],
  }));
}

export async function createQuizQuestion(quizId: number, prompt: string): Promise<number> {
  const [countRows] = await db.query(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM quiz_questions WHERE quiz_id = ?",
    [quizId]
  );
  const nextPosition = (countRows as RowDataPacket[])[0].next_position as number;
  const [result] = await db.execute(
    "INSERT INTO quiz_questions (quiz_id, position, prompt) VALUES (?, ?, ?)",
    [quizId, nextPosition, prompt]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateQuizQuestion(questionId: number, prompt: string): Promise<void> {
  await db.execute("UPDATE quiz_questions SET prompt = ? WHERE id = ?", [prompt, questionId]);
}

export async function deleteQuizQuestion(questionId: number): Promise<void> {
  await db.execute("DELETE FROM quiz_questions WHERE id = ?", [questionId]);
}

export async function reorderQuizQuestions(quizId: number, orderedQuestionIds: number[]): Promise<void> {
  await Promise.all(
    orderedQuestionIds.map((questionId, index) =>
      db.execute("UPDATE quiz_questions SET position = ? WHERE id = ? AND quiz_id = ?", [
        index,
        questionId,
        quizId,
      ])
    )
  );
}

export async function createQuizChoice(questionId: number, label: string, isCorrect: boolean): Promise<number> {
  const [countRows] = await db.query(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM quiz_choices WHERE question_id = ?",
    [questionId]
  );
  const nextPosition = (countRows as RowDataPacket[])[0].next_position as number;
  const [result] = await db.execute(
    "INSERT INTO quiz_choices (question_id, position, label, is_correct) VALUES (?, ?, ?, ?)",
    [questionId, nextPosition, label, isCorrect]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateQuizChoiceLabel(choiceId: number, label: string): Promise<void> {
  await db.execute("UPDATE quiz_choices SET label = ? WHERE id = ?", [label, choiceId]);
}

/** Single-answer questions: marking one choice correct clears every sibling choice in the same question atomically. */
export async function setCorrectChoice(questionId: number, choiceId: number): Promise<void> {
  await db.execute("UPDATE quiz_choices SET is_correct = (id = ?) WHERE question_id = ?", [
    choiceId,
    questionId,
  ]);
}

export async function deleteQuizChoice(choiceId: number): Promise<void> {
  await db.execute("DELETE FROM quiz_choices WHERE id = ?", [choiceId]);
}

interface AttemptRow extends RowDataPacket {
  id: number;
  quiz_id: number;
  score: number;
  passed: number | boolean;
  submitted_at: string;
}

export async function getLatestAttempt(quizId: number, userId: number): Promise<TebikiQuizAttempt | null> {
  const [rows] = await db.query(
    "SELECT id, quiz_id, score, passed, submitted_at FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY submitted_at DESC LIMIT 1",
    [quizId, userId]
  );
  const row = (rows as AttemptRow[])[0];
  if (!row) return null;
  return {
    id: String(row.id),
    quizId: String(row.quiz_id),
    score: row.score,
    passed: Boolean(row.passed),
    submittedAt: row.submitted_at,
  };
}

/**
 * Scores server-side against the stored `is_correct` flags -- never trust a
 * client-submitted score. `answers` maps questionId -> the chosen choiceId;
 * unanswered questions count as incorrect.
 */
export async function submitQuizAttempt(
  quizId: number,
  userId: number,
  passScore: number,
  answers: { questionId: number; choiceId: number }[]
): Promise<{ attemptId: number; score: number; passed: boolean }> {
  const questions = await getQuizQuestions(quizId);
  const correctChoiceByQuestion = new Map<string, string>();
  for (const q of questions) {
    const correct = q.choices.find((c) => c.isCorrect);
    if (correct) correctChoiceByQuestion.set(q.id, correct.id);
  }

  let correctCount = 0;
  for (const a of answers) {
    if (correctChoiceByQuestion.get(String(a.questionId)) === String(a.choiceId)) {
      correctCount += 1;
    }
  }

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= passScore;

  const [result] = await db.execute(
    "INSERT INTO quiz_attempts (quiz_id, user_id, score, passed) VALUES (?, ?, ?, ?)",
    [quizId, userId, score, passed]
  );
  const attemptId = (result as ResultSetHeader).insertId;

  const validAnswers = answers.filter((a) => correctChoiceByQuestion.has(String(a.questionId)));
  if (validAnswers.length > 0) {
    const values = validAnswers.map(() => "(?, ?, ?)").join(", ");
    const params = validAnswers.flatMap((a) => [attemptId, a.questionId, a.choiceId]);
    await db.execute(
      `INSERT INTO quiz_attempt_answers (attempt_id, question_id, choice_id) VALUES ${values}`,
      params
    );
  }

  return { attemptId, score, passed };
}
