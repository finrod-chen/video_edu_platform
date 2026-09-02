import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

const LOCK_TTL_MINUTES = 10;

export interface StepLockInfo {
  lockedByName: string;
  lockedAt: string;
}

/**
 * Atomic compare-and-set: grants the lock if it's unheld, stale (no renewal
 * within LOCK_TTL_MINUTES -- covers a closed tab that never released it), or
 * already held by this same user (re-opening the editor renews it). A plain
 * SELECT-then-UPDATE would race between two simultaneous acquire calls; this
 * single UPDATE with the ownership condition in its WHERE clause doesn't.
 */
export async function acquireStepLock(
  stepId: number,
  userId: number
): Promise<{ ok: true } | { ok: false; info: StepLockInfo }> {
  const [result] = await db.execute(
    `UPDATE manual_steps
     SET edit_lock_user_id = ?, edit_lock_at = CURRENT_TIMESTAMP
     WHERE id = ? AND (
       edit_lock_user_id IS NULL
       OR edit_lock_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${LOCK_TTL_MINUTES} MINUTE)
       OR edit_lock_user_id = ?
     )`,
    [userId, stepId, userId]
  );
  if ((result as ResultSetHeader).affectedRows > 0) {
    return { ok: true };
  }
  const info = await getStepLockInfo(stepId);
  return { ok: false, info: info ?? { lockedByName: "另一位使用者", lockedAt: "" } };
}

export async function renewStepLock(stepId: number, userId: number): Promise<boolean> {
  const [result] = await db.execute(
    "UPDATE manual_steps SET edit_lock_at = CURRENT_TIMESTAMP WHERE id = ? AND edit_lock_user_id = ?",
    [stepId, userId]
  );
  return (result as ResultSetHeader).affectedRows > 0;
}

/** Only releases a lock this user currently holds -- never clears someone else's lock. */
export async function releaseStepLock(stepId: number, userId: number): Promise<void> {
  await db.execute(
    "UPDATE manual_steps SET edit_lock_user_id = NULL, edit_lock_at = NULL WHERE id = ? AND edit_lock_user_id = ?",
    [stepId, userId]
  );
}

interface LockRow extends RowDataPacket {
  name: string;
  edit_lock_at: string;
}

/** A stale (expired) lock is reported as unlocked. */
export async function getStepLockInfo(stepId: number): Promise<StepLockInfo | null> {
  const [rows] = await db.query(
    `SELECT u.name, ms.edit_lock_at
     FROM manual_steps ms
     JOIN users u ON u.id = ms.edit_lock_user_id
     WHERE ms.id = ? AND ms.edit_lock_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${LOCK_TTL_MINUTES} MINUTE)`,
    [stepId]
  );
  const row = (rows as LockRow[])[0];
  return row ? { lockedByName: row.name, lockedAt: row.edit_lock_at } : null;
}
