import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { ManualStatus, TebikiManual, TebikiManualStep } from "@/types/tebiki";

export type { ManualStatus };

interface ManualRow extends RowDataPacket {
  id: number;
  title: string;
  folder_id: number | null;
  updated_by_name: string | null;
  updated_at: string;
  tags: string | null;
}

export async function getManuals(
  orgId: number,
  status: ManualStatus,
  keyword?: string,
  order: "asc" | "desc" = "desc",
  folderId?: number | null
): Promise<TebikiManual[]> {
  const params: (string | number)[] = [orgId, status];
  let keywordClause = "";
  if (keyword) {
    keywordClause = " AND m.title LIKE ?";
    params.push(`%${keyword}%`);
  }
  let folderClause = "";
  if (folderId !== undefined) {
    folderClause = folderId === null ? " AND m.folder_id IS NULL" : " AND m.folder_id = ?";
    if (folderId !== null) params.push(folderId);
  }
  const orderSql = order === "asc" ? "ASC" : "DESC";

  const [rows] = await db.query(
    `SELECT m.id, m.title, m.folder_id, u.name AS updated_by_name, m.updated_at,
            GROUP_CONCAT(t.name SEPARATOR ',') AS tags
     FROM manuals m
     LEFT JOIN users u ON u.id = m.updated_by
     LEFT JOIN manual_tags mt ON mt.manual_id = m.id
     LEFT JOIN tags t ON t.id = mt.tag_id
     WHERE m.org_id = ? AND m.status = ?${keywordClause}${folderClause}
     GROUP BY m.id, m.title, m.folder_id, u.name, m.updated_at
     ORDER BY m.updated_at ${orderSql}`,
    params
  );

  return (rows as ManualRow[]).map((r) => ({
    id: String(r.id),
    title: r.title,
    folderId: r.folder_id === null ? null : String(r.folder_id),
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
  has_been_published: number | boolean;
  folder_id: number | null;
  updated_at: string;
}

export async function getManualById(
  orgId: number,
  manualId: number
): Promise<TebikiManual | null> {
  const [rows] = await db.query(
    "SELECT id, org_id, title, description, status, has_been_published, folder_id, updated_at FROM manuals WHERE id = ? AND org_id = ?",
    [manualId, orgId]
  );
  const row = (rows as ManualDetailRow[])[0];
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    hasBeenPublished: Boolean(row.has_been_published),
    folderId: row.folder_id === null ? null : String(row.folder_id),
    updatedBy: "",
    updatedAt: row.updated_at,
    tags: [],
  };
}

export async function createManual(
  orgId: number,
  userId: number,
  title: string,
  folderId: number | null = null
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO manuals (org_id, title, status, updated_by, folder_id) VALUES (?, ?, 'draft', ?, ?)",
    [orgId, title, userId, folderId]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateManual(
  orgId: number,
  manualId: number,
  userId: number,
  fields: { title?: string; description?: string; status?: ManualStatus; folderId?: number | null }
): Promise<void> {
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
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
    if (fields.status === "published") {
      sets.push("has_been_published = TRUE");
    }
  }
  if (fields.folderId !== undefined) {
    sets.push("folder_id = ?");
    params.push(fields.folderId);
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
  caption_status: "none" | "pending" | "done" | "failed";
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
    captionStatus: r.caption_status,
  };
}

const STEP_SELECT =
  "SELECT id, manual_id, position, title, video_path, thumbnail_path, duration_seconds, captions_vtt, caption_status FROM manual_steps";

export async function getManualSteps(manualId: number): Promise<TebikiManualStep[]> {
  const [rows] = await db.query(`${STEP_SELECT} WHERE manual_id = ? ORDER BY position ASC`, [manualId]);
  return (rows as StepRow[]).map(mapStep);
}

export async function getManualStepById(
  manualId: number,
  stepId: number
): Promise<TebikiManualStep | null> {
  const [rows] = await db.query(`${STEP_SELECT} WHERE id = ? AND manual_id = ?`, [stepId, manualId]);
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
    captionsVtt?: string | null;
    captionStatus?: "none" | "pending" | "done" | "failed";
  }
): Promise<void> {
  const columnMap: Record<string, string> = {
    title: "title",
    videoPath: "video_path",
    thumbnailPath: "thumbnail_path",
    durationSeconds: "duration_seconds",
    captionsVtt: "captions_vtt",
    captionStatus: "caption_status",
  };
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  for (const [key, column] of Object.entries(columnMap)) {
    const value = (fields as Record<string, string | number | null | undefined>)[key];
    if (value !== undefined) {
      sets.push(`${column} = ?`);
      params.push(value);
    }
  }
  // A freshly-uploaded video invalidates any previous transcription for this step.
  if (fields.videoPath !== undefined && fields.captionsVtt === undefined && fields.captionStatus === undefined) {
    sets.push("captions_vtt = NULL", "caption_status = 'none'");
  }
  if (sets.length === 0) return;
  params.push(stepId);
  await db.execute(`UPDATE manual_steps SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteManualStep(stepId: number): Promise<void> {
  await db.execute("DELETE FROM manual_steps WHERE id = ?", [stepId]);
}

/** Steps with an uploaded video but no caption attempt yet -- used to seed a batch backfill run. */
export async function getStepsNeedingCaptions(
  orgId: number
): Promise<{ manualId: number; stepId: number }[]> {
  const [rows] = await db.query(
    `SELECT s.manual_id, s.id AS step_id
     FROM manual_steps s
     JOIN manuals m ON m.id = s.manual_id
     WHERE m.org_id = ? AND s.video_path IS NOT NULL AND s.caption_status = 'none'
     ORDER BY s.manual_id ASC, s.position ASC`,
    [orgId]
  );
  return (rows as RowDataPacket[]).map((r) => ({
    manualId: Number(r.manual_id),
    stepId: Number(r.step_id),
  }));
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
