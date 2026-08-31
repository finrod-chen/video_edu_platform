import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { TebikiManual } from "@/types/tebiki";

export type ManualStatus = "published" | "draft" | "trashed";

interface ManualRow extends RowDataPacket {
  id: number;
  title: string;
  updated_by_name: string | null;
  updated_at: string;
  tags: string | null;
}

export async function getManuals(
  orgId: number,
  status: ManualStatus,
  keyword?: string
): Promise<TebikiManual[]> {
  const params: (string | number)[] = [orgId, status];
  let keywordClause = "";
  if (keyword) {
    keywordClause = " AND m.title LIKE ?";
    params.push(`%${keyword}%`);
  }

  const [rows] = await db.query(
    `SELECT m.id, m.title, u.name AS updated_by_name, m.updated_at,
            GROUP_CONCAT(t.name SEPARATOR ',') AS tags
     FROM manuals m
     LEFT JOIN users u ON u.id = m.updated_by
     LEFT JOIN manual_tags mt ON mt.manual_id = m.id
     LEFT JOIN tags t ON t.id = mt.tag_id
     WHERE m.org_id = ? AND m.status = ?${keywordClause}
     GROUP BY m.id, m.title, u.name, m.updated_at
     ORDER BY m.updated_at DESC`,
    params
  );

  return (rows as ManualRow[]).map((r) => ({
    id: String(r.id),
    title: r.title,
    updatedBy: r.updated_by_name ?? "—",
    updatedAt: r.updated_at,
    tags: r.tags ? r.tags.split(",") : [],
  }));
}
