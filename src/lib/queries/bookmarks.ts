import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface BookmarkedManualRow extends RowDataPacket {
  id: number;
  title: string;
}

export async function getBookmarkedManuals(userId: number) {
  const [rows] = await db.query(
    `SELECT m.id, m.title
     FROM bookmarks b
     JOIN manuals m ON m.id = b.item_id AND b.item_type = 'manual'
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return (rows as BookmarkedManualRow[]).map((r) => ({ id: String(r.id), title: r.title }));
}

export async function getBookmarkedCourses(userId: number) {
  const [rows] = await db.query(
    `SELECT c.id, c.title
     FROM bookmarks b
     JOIN courses c ON c.id = b.item_id AND b.item_type = 'course'
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return (rows as { id: number; title: string }[]).map((r) => ({ id: String(r.id), title: r.title }));
}
