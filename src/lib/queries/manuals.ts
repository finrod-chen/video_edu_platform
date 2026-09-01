import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { ManualStatus, TebikiManual, TebikiManualStep } from "@/types/tebiki";

export type { ManualStatus };

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
  keyword?: string,
  order: "asc" | "desc" = "desc"
): Promise<TebikiManual[]> {
  const params: (string | number)[] = [orgId, status];
  let keywordClause = "";
  if (keyword) {
    keywordClause = " AND m.title LIKE ?";
    params.push(`%${keyword}%`);
  }
  const orderSql = order === "asc" ? "ASC" : "DESC";

  const [rows] = await db.query(
    `SELECT m.id, m.title, u.name AS updated_by_name, m.updated_at,
            GROUP_CONCAT(t.name SEPARATOR ',') AS tags
     FROM manuals m
     LEFT JOIN users u ON u.id = m.updated_by
     LEFT JOIN manual_tags mt ON mt.manual_id = m.id
     LEFT JOIN tags t ON t.id = mt.tag_id
     WHERE m.org_id = ? AND m.status = ?${keywordClause}
     GROUP BY m.id, m.title, u.name, m.updated_at
     ORDER BY m.updated_at ${orderSql}`,
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

interface ManualDetailRow extends RowDataPacket {
  id: number;
  org_id: number;
  title: string;
  description: string | null;
  status: ManualStatus;
  updated_at: string;
}

export async function getManualById(
  orgId: number,
  manualId: number
): Promise<TebikiManual | null> {
  const [rows] = await db.query(
    "SELECT id, org_id, title, description, status, updated_at FROM manuals WHERE id = ? AND org_id = ?",
    [manualId, orgId]
  );
  const row = (rows as ManualDetailRow[])[0];
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    updatedBy: "",
    updatedAt: row.updated_at,
    tags: [],
  };
}

export async function createManual(
  orgId: number,
  userId: number,
  title: string
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO manuals (org_id, title, status, updated_by) VALUES (?, ?, 'draft', ?)",
    [orgId, title, userId]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateManual(
  orgId: number,
  manualId: number,
  userId: number,
  fields: { title?: string; description?: string; status?: ManualStatus }
): Promise<void> {
  const sets: string[] = [];
  const params: (string | number)[] = [];
  if (fields.title !== undefined) {
    sets.push("title = ?");
    params.push(fields.title);
  }
  if (fields.description !== undefined) {
    sets.push("description = ?");
    params.push(fields.description);
  }
  if (fields.status !== undefined) {
    sets.push("status = ?");
    params.push(fields.status);
  }
  if (sets.length === 0) return;
  sets.push("updated_by = ?");
  params.push(userId, manualId, orgId);

  await db.execute(
    `UPDATE manuals SET ${sets.join(", ")} WHERE id = ? AND org_id = ?`,
    params
  );
}

/** Permanently deletes a manual (its steps/tags/course links cascade via FK). */
export async function deleteManual(orgId: number, manualId: number): Promise<void> {
  await db.execute("DELETE FROM manuals WHERE id = ? AND org_id = ?", [manualId, orgId]);
}

interface StepRow extends RowDataPacket {
  id: number;
  manual_id: number;
  position: number;
  title: string;
  video_path: string | null;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  captions_vtt: string | null;
}

function mapStep(r: StepRow): TebikiManualStep {
  return {
    id: String(r.id),
    manualId: String(r.manual_id),
    position: r.position,
    title: r.title,
    videoPath: r.video_path,
    thumbnailPath: r.thumbnail_path,
    durationSeconds: r.duration_seconds,
    captionsVtt: r.captions_vtt,
  };
}

export async function getManualSteps(manualId: number): Promise<TebikiManualStep[]> {
  const [rows] = await db.query(
    "SELECT id, manual_id, position, title, video_path, thumbnail_path, duration_seconds, captions_vtt FROM manual_steps WHERE manual_id = ? ORDER BY position ASC",
    [manualId]
  );
  return (rows as StepRow[]).map(mapStep);
}

export async function getManualStepById(
  manualId: number,
  stepId: number
): Promise<TebikiManualStep | null> {
  const [rows] = await db.query(
    "SELECT id, manual_id, position, title, video_path, thumbnail_path, duration_seconds, captions_vtt FROM manual_steps WHERE id = ? AND manual_id = ?",
    [stepId, manualId]
  );
  const row = (rows as StepRow[])[0];
  return row ? mapStep(row) : null;
}

export async function createManualStep(
  manualId: number,
  title: string
): Promise<number> {
  const [countRows] = await db.query(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM manual_steps WHERE manual_id = ?",
    [manualId]
  );
  const nextPosition = (countRows as RowDataPacket[])[0].next_position as number;

  const [result] = await db.execute(
    "INSERT INTO manual_steps (manual_id, position, title) VALUES (?, ?, ?)",
    [manualId, nextPosition, title]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateManualStep(
  stepId: number,
  fields: {
    title?: string;
    videoPath?: string;
    thumbnailPath?: string;
    durationSeconds?: number;
    captionsVtt?: string;
  }
): Promise<void> {
  const columnMap: Record<string, string> = {
    title: "title",
    videoPath: "video_path",
    thumbnailPath: "thumbnail_path",
    durationSeconds: "duration_seconds",
    captionsVtt: "captions_vtt",
  };
  const sets: string[] = [];
  const params: (string | number)[] = [];
  for (const [key, column] of Object.entries(columnMap)) {
    const value = (fields as Record<string, string | number | undefined>)[key];
    if (value !== undefined) {
      sets.push(`${column} = ?`);
      params.push(value);
    }
  }
  if (sets.length === 0) return;
  params.push(stepId);
  await db.execute(`UPDATE manual_steps SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteManualStep(stepId: number): Promise<void> {
  await db.execute("DELETE FROM manual_steps WHERE id = ?", [stepId]);
}

export async function reorderManualSteps(
  manualId: number,
  orderedStepIds: number[]
): Promise<void> {
  await Promise.all(
    orderedStepIds.map((stepId, index) =>
      db.execute(
        "UPDATE manual_steps SET position = ? WHERE id = ? AND manual_id = ?",
        [index, stepId, manualId]
      )
    )
  );
}
