import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { TebikiTag } from "@/types/tebiki";

interface TagRow extends RowDataPacket {
  id: number;
  name: string;
  manual_count: number;
}

export async function getTags(orgId: number): Promise<TebikiTag[]> {
  const [rows] = await db.query(
    `SELECT t.id, t.name, COUNT(mt.manual_id) AS manual_count
     FROM tags t
     LEFT JOIN manual_tags mt ON mt.tag_id = t.id
     WHERE t.org_id = ?
     GROUP BY t.id, t.name
     ORDER BY t.name ASC`,
    [orgId]
  );
  return (rows as TagRow[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    manualCount: r.manual_count,
  }));
}
