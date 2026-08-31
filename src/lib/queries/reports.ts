import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { RankingEntry, ReportSummary, VisitorDataPoint } from "@/types/tebiki";

interface DailyRow extends RowDataPacket {
  visit_date: string;
  visitor_count: number;
  watch_hours: string;
}

export async function getVisitorSeries(orgId: number, days = 30): Promise<VisitorDataPoint[]> {
  const [rows] = await db.query(
    `SELECT visit_date, visitor_count, watch_hours
     FROM manual_view_daily
     WHERE org_id = ? AND visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY visit_date ASC`,
    [orgId, days]
  );
  return (rows as DailyRow[]).map((r) => ({
    date: r.visit_date,
    visitors: r.visitor_count,
    watchHours: Number(r.watch_hours),
  }));
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
       COALESCE((SELECT SUM(watch_hours) FROM manual_view_daily WHERE org_id = ?), 0) AS manual_watch_hours,
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
