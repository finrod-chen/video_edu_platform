import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { manualCompletedExpr } from "@/lib/queries/completion";
import type {
  AcknowledgmentStats,
  AssignmentStats,
  QuizStats,
  RankingEntry,
  ReportSummary,
  VisitorDataPoint,
} from "@/types/models";

interface DailyRow extends RowDataPacket {
  visit_date: string;
  visitor_count: number;
  watch_seconds: string;
}

export async function getVisitorSeries(orgId: number, days = 30): Promise<VisitorDataPoint[]> {
  const [rows] = await db.query(
    `SELECT visit_date, COUNT(DISTINCT user_id) AS visitor_count, SUM(watch_seconds) AS watch_seconds
     FROM manual_daily_visits
     WHERE org_id = ? AND visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY visit_date
     ORDER BY visit_date ASC`,
    [orgId, days]
  );
  return (rows as DailyRow[]).map((r) => ({
    date: r.visit_date,
    visitors: r.visitor_count,
    watchHours: Number(r.watch_seconds) / 3600,
  }));
}

/**
 * Registers a manual view for today (creating the row even with
 * watchSeconds=0 counts as a "visit"), and atomically adds to the
 * accumulated watch time for that user/manual/day.
 */
export async function recordManualView(
  orgId: number,
  manualId: number,
  userId: number,
  watchSeconds = 0
): Promise<void> {
  await db.execute(
    `INSERT INTO manual_daily_visits (org_id, manual_id, user_id, visit_date, watch_seconds)
     VALUES (?, ?, ?, CURDATE(), ?)
     ON DUPLICATE KEY UPDATE watch_seconds = watch_seconds + VALUES(watch_seconds)`,
    [orgId, manualId, userId, watchSeconds]
  );
}

interface SummaryRow extends RowDataPacket {
  manual_watch_hours: string;
  course_count: number;
  manual_count: number;
  user_count: number;
}

export async function getReportSummary(orgId: number): Promise<ReportSummary> {
  const [rows] = await db.query(
    `SELECT
       COALESCE((SELECT SUM(watch_seconds) FROM manual_daily_visits WHERE org_id = ?), 0) / 3600 AS manual_watch_hours,
       (SELECT COUNT(*) FROM courses WHERE org_id = ?) AS course_count,
       (SELECT COUNT(*) FROM manuals WHERE org_id = ? AND status = 'published') AS manual_count,
       (SELECT COUNT(*) FROM users WHERE org_id = ? AND status = 'active') AS user_count`,
    [orgId, orgId, orgId, orgId]
  );
  const row = (rows as SummaryRow[])[0];
  return {
    manualWatchHours: Math.round(Number(row?.manual_watch_hours ?? 0)),
    courseCount: row?.course_count ?? 0,
    manualCount: row?.manual_count ?? 0,
    userCount: row?.user_count ?? 0,
  };
}

interface RankingRow extends RowDataPacket {
  id: number;
  label: string;
  value: number;
}

export async function getUserAccessRanking(orgId: number, limit = 5): Promise<RankingEntry[]> {
  const [rows] = await db.query(
    `SELECT u.id, u.name AS label, COUNT(b.id) AS value
     FROM users u
     LEFT JOIN bookmarks b ON b.user_id = u.id
     WHERE u.org_id = ?
     GROUP BY u.id, u.name
     ORDER BY value DESC
     LIMIT ?`,
    [orgId, limit]
  );
  return (rows as RankingRow[]).map((r) => ({ id: String(r.id), label: r.label, value: r.value }));
}

export async function getAcknowledgmentStats(orgId: number): Promise<AcknowledgmentStats> {
  const [[possibleRows], [completedRows]] = await Promise.all([
    db.query(
      `SELECT
         (SELECT COUNT(*) FROM manuals WHERE org_id = ? AND status = 'published') AS manual_count,
         (SELECT COUNT(*) FROM users WHERE org_id = ? AND status = 'active') AS user_count`,
      [orgId, orgId]
    ),
    db.query(
      `SELECT COUNT(*) AS completed_count
       FROM manuals m
       CROSS JOIN users u
       WHERE m.org_id = ? AND m.status = 'published' AND u.org_id = ? AND u.status = 'active'
         AND ${manualCompletedExpr("m.id", "u.id")}`,
      [orgId, orgId]
    ),
  ]);

  const possibleRow = (possibleRows as RowDataPacket[])[0];
  const possibleCount = Number(possibleRow?.manual_count ?? 0) * Number(possibleRow?.user_count ?? 0);
  const acknowledgedCount = Number((completedRows as RowDataPacket[])[0]?.completed_count ?? 0);

  return {
    acknowledgedCount,
    possibleCount,
    rate: possibleCount > 0 ? Math.round((acknowledgedCount / possibleCount) * 100) : 0,
  };
}

export async function getQuizStats(orgId: number): Promise<QuizStats> {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS attempt_count, AVG(latest.score) AS avg_score, SUM(latest.passed) AS passed_count
     FROM (
       SELECT qa.score, qa.passed
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id AND q.org_id = ?
       LEFT JOIN quiz_attempts newer
         ON newer.quiz_id = qa.quiz_id AND newer.user_id = qa.user_id AND newer.submitted_at > qa.submitted_at
       WHERE newer.id IS NULL
     ) latest`,
    [orgId]
  );
  const row = (rows as RowDataPacket[])[0];
  const attemptCount = Number(row?.attempt_count ?? 0);
  const passedCount = Number(row?.passed_count ?? 0);

  return {
    attemptCount,
    passRate: attemptCount > 0 ? Math.round((passedCount / attemptCount) * 100) : 0,
    averageScore: attemptCount > 0 ? Math.round(Number(row?.avg_score ?? 0)) : 0,
  };
}

export async function getAssignmentStats(orgId: number): Promise<AssignmentStats> {
  const completedExpr = manualCompletedExpr("a.manual_id", "at.user_id");
  const [rows] = await db.query(
    `SELECT
       COUNT(*) AS total_count,
       SUM(CASE WHEN ${completedExpr} THEN 1 ELSE 0 END) AS completed_count,
       SUM(CASE WHEN NOT ${completedExpr} AND a.due_date IS NOT NULL AND a.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue_count
     FROM assignment_targets at
     JOIN assignments a ON a.id = at.assignment_id AND a.org_id = ?`,
    [orgId]
  );
  const row = (rows as RowDataPacket[])[0];
  return {
    totalCount: Number(row?.total_count ?? 0),
    completedCount: Number(row?.completed_count ?? 0),
    overdueCount: Number(row?.overdue_count ?? 0),
  };
}
