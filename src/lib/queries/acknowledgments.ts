import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function acknowledgeStep(stepId: number, userId: number): Promise<void> {
  await db.execute(
    "INSERT IGNORE INTO manual_step_acknowledgments (manual_step_id, user_id) VALUES (?, ?)",
    [stepId, userId]
  );
}

/** Batch lookup for the manual viewer: which of these steps has this user already acknowledged. */
export async function getAcknowledgedStepIds(userId: number, stepIds: number[]): Promise<Set<string>> {
  if (stepIds.length === 0) return new Set();
  const [rows] = await db.query(
    `SELECT manual_step_id FROM manual_step_acknowledgments
     WHERE user_id = ? AND manual_step_id IN (${stepIds.map(() => "?").join(",")})`,
    [userId, ...stepIds]
  );
  return new Set((rows as RowDataPacket[]).map((r) => String(r.manual_step_id)));
}

/**
 * Whether the last step (highest position) of a manual has been confirmed by
 * this user -- gates access to that manual's quiz. Keep in sync with the
 * ELSE branch of manualCompletedExpr() in completion.ts, which expresses the
 * same rule inline for use in larger joined queries.
 */
export async function isLastStepAcknowledged(manualId: number, userId: number): Promise<boolean> {
  const [rows] = await db.query(
    `SELECT 1 FROM manual_steps ms
     JOIN manual_step_acknowledgments msa
       ON msa.manual_step_id = ms.id AND msa.user_id = ?
     WHERE ms.manual_id = ?
       AND ms.position = (SELECT MAX(position) FROM manual_steps WHERE manual_id = ?)
     LIMIT 1`,
    [userId, manualId, manualId]
  );
  return (rows as RowDataPacket[]).length > 0;
}
