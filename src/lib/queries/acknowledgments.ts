import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function getAcknowledgment(manualId: number, userId: number): Promise<boolean> {
  const [rows] = await db.query(
    "SELECT 1 FROM manual_acknowledgments WHERE manual_id = ? AND user_id = ?",
    [manualId, userId]
  );
  return (rows as RowDataPacket[]).length > 0;
}

export async function acknowledgeManual(manualId: number, userId: number): Promise<void> {
  await db.execute(
    "INSERT IGNORE INTO manual_acknowledgments (manual_id, user_id) VALUES (?, ?)",
    [manualId, userId]
  );
}

/** Batch lookup for course-detail pages: which of these manuals has this user already acknowledged. */
export async function getAcknowledgedManualIds(
  userId: number,
  manualIds: number[]
): Promise<Set<string>> {
  if (manualIds.length === 0) return new Set();
  const [rows] = await db.query(
    `SELECT manual_id FROM manual_acknowledgments
     WHERE user_id = ? AND manual_id IN (${manualIds.map(() => "?").join(",")})`,
    [userId, ...manualIds]
  );
  return new Set((rows as RowDataPacket[]).map((r) => String(r.manual_id)));
}
