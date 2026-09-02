import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface SearchResult {
  type: "manual" | "course";
  id: string;
  title: string;
}

interface SearchRow extends RowDataPacket {
  id: number;
  title: string;
}

const RESULT_LIMIT = 6;

/** Published manuals + courses only -- this powers the header/report search boxes every logged-in user can use. */
export async function searchContent(orgId: number, keyword: string): Promise<SearchResult[]> {
  const like = `%${keyword}%`;
  const [manualRows, courseRows] = await Promise.all([
    db.query(
      "SELECT id, title FROM manuals WHERE org_id = ? AND status = 'published' AND title LIKE ? ORDER BY updated_at DESC LIMIT ?",
      [orgId, like, RESULT_LIMIT]
    ),
    db.query(
      "SELECT id, title FROM courses WHERE org_id = ? AND status = 'published' AND title LIKE ? ORDER BY updated_at DESC LIMIT ?",
      [orgId, like, RESULT_LIMIT]
    ),
  ]);

  const manuals = (manualRows[0] as SearchRow[]).map((r) => ({
    type: "manual" as const,
    id: String(r.id),
    title: r.title,
  }));
  const courses = (courseRows[0] as SearchRow[]).map((r) => ({
    type: "course" as const,
    id: String(r.id),
    title: r.title,
  }));
  return [...manuals, ...courses];
}
