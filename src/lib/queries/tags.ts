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

interface ManualTagRow extends RowDataPacket {
  id: number;
  name: string;
}

export async function getTagsForManual(manualId: number): Promise<TebikiTag[]> {
  const [rows] = await db.query(
    `SELECT t.id, t.name
     FROM manual_tags mt
     JOIN tags t ON t.id = mt.tag_id
     WHERE mt.manual_id = ?
     ORDER BY t.name ASC`,
    [manualId]
  );
  return (rows as ManualTagRow[]).map((r) => ({ id: String(r.id), name: r.name, manualCount: 0 }));
}

/** Finds-or-creates a tag by name (per org) and links it to the manual. */
export async function addManualTag(
  orgId: number,
  manualId: number,
  tagName: string
): Promise<TebikiTag> {
  const name = tagName.trim();
  await db.execute(
    "INSERT IGNORE INTO tags (org_id, name) VALUES (?, ?)",
    [orgId, name]
  );
  const [rows] = await db.query(
    "SELECT id, name FROM tags WHERE org_id = ? AND name = ?",
    [orgId, name]
  );
  const tag = (rows as ManualTagRow[])[0];
  await db.execute(
    "INSERT IGNORE INTO manual_tags (manual_id, tag_id) VALUES (?, ?)",
    [manualId, tag.id]
  );
  return { id: String(tag.id), name: tag.name, manualCount: 0 };
}

export async function removeManualTag(manualId: number, tagId: number): Promise<void> {
  await db.execute(
    "DELETE FROM manual_tags WHERE manual_id = ? AND tag_id = ?",
    [manualId, tagId]
  );
}
