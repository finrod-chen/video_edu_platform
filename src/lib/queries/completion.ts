import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { isLastStepAcknowledged } from "@/lib/queries/acknowledgments";
import { getCourseManuals } from "@/lib/queries/courses";

/**
 * SQL fragment for "is this manual complete for this user":
 *   - has a published manual-scope quiz -> ever passed an attempt on it
 *   - otherwise -> confirmed the last step (highest position)
 *
 * `manualIdCol`/`userIdCol` are caller-controlled SQL column references
 * (e.g. "a.manual_id", "at.user_id"), never user input -- safe to
 * interpolate. For use inside larger joined queries (assignments.ts,
 * reports.ts) where the manual/user id come from other tables in the same
 * query, not from a bound parameter. For single-manual/single-user lookups,
 * use isManualComplete()/getCompletedManualIds() below instead, which bind
 * plain `?` parameters and don't require placeholder-order bookkeeping.
 *
 * Keep the "last step confirmed" branch in sync with isLastStepAcknowledged()
 * in acknowledgments.ts, which expresses the same rule as a standalone query.
 */
export function manualCompletedExpr(manualIdCol: string, userIdCol: string): string {
  return `(
    CASE
      WHEN EXISTS (
        SELECT 1 FROM quizzes q
        WHERE q.scope = 'manual' AND q.manual_id = ${manualIdCol} AND q.status = 'published'
      )
      THEN EXISTS (
        SELECT 1 FROM quiz_attempts qa
        JOIN quizzes q2 ON q2.id = qa.quiz_id
        WHERE q2.scope = 'manual' AND q2.manual_id = ${manualIdCol}
          AND qa.user_id = ${userIdCol} AND qa.passed = TRUE
      )
      ELSE EXISTS (
        SELECT 1 FROM manual_steps ms
        JOIN manual_step_acknowledgments msa ON msa.manual_step_id = ms.id
        WHERE ms.manual_id = ${manualIdCol}
          AND msa.user_id = ${userIdCol}
          AND ms.position = (SELECT MAX(position) FROM manual_steps WHERE manual_id = ${manualIdCol})
      )
    END
  )`;
}

export async function isManualComplete(manualId: number, userId: number): Promise<boolean> {
  const [publishedQuizRows] = await db.query(
    "SELECT id FROM quizzes WHERE scope = 'manual' AND manual_id = ? AND status = 'published' LIMIT 1",
    [manualId]
  );
  const quiz = (publishedQuizRows as RowDataPacket[])[0];

  if (quiz) {
    const [attemptRows] = await db.query(
      "SELECT 1 FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? AND passed = TRUE LIMIT 1",
      [quiz.id, userId]
    );
    return (attemptRows as RowDataPacket[]).length > 0;
  }

  return isLastStepAcknowledged(manualId, userId);
}

export async function getCompletedManualIds(userId: number, manualIds: number[]): Promise<Set<string>> {
  if (manualIds.length === 0) return new Set();
  const completed = await Promise.all(
    manualIds.map(async (manualId) => ({
      manualId,
      complete: await isManualComplete(manualId, userId),
    }))
  );
  return new Set(completed.filter((c) => c.complete).map((c) => String(c.manualId)));
}

/**
 * A course is "complete" for a user once every manual in it is complete.
 * Course-scope assignments are expected to be far less numerous than
 * manual-scope ones, so this per-manual-completion loop (rather than a
 * single SQL aggregate like manualCompletedExpr) is fine performance-wise.
 */
export async function isCourseComplete(courseId: number, userId: number): Promise<boolean> {
  const courseManuals = await getCourseManuals(courseId);
  if (courseManuals.length === 0) return false;
  const results = await Promise.all(
    courseManuals.map((cm) => isManualComplete(Number(cm.manualId), userId))
  );
  return results.every(Boolean);
}
