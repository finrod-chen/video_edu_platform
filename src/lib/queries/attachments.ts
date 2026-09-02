import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { ManualAttachment } from "@/types/models";

interface AttachmentRow extends RowDataPacket {
  id: number;
  manual_id: number;
  original_filename: string;
  file_size: number;
  created_at: string;
}

function mapAttachment(r: AttachmentRow): ManualAttachment {
  return {
    id: String(r.id),
    manualId: String(r.manual_id),
    fileName: r.original_filename,
    fileSize: r.file_size,
    createdAt: r.created_at,
  };
}

const ATTACHMENT_SELECT =
  "SELECT id, manual_id, original_filename, file_size, created_at FROM manual_attachments";

export async function listManualAttachments(manualId: number): Promise<ManualAttachment[]> {
  const [rows] = await db.query(`${ATTACHMENT_SELECT} WHERE manual_id = ? ORDER BY created_at DESC`, [
    manualId,
  ]);
  return (rows as AttachmentRow[]).map(mapAttachment);
}

export async function getManualAttachmentById(
  orgId: number,
  attachmentId: number
): Promise<ManualAttachment | null> {
  const [rows] = await db.query(`${ATTACHMENT_SELECT} WHERE id = ? AND org_id = ?`, [
    attachmentId,
    orgId,
  ]);
  const row = (rows as AttachmentRow[])[0];
  return row ? mapAttachment(row) : null;
}

/** Inserts a placeholder row (no file_path yet) so the caller has an id to name the stored file after. */
export async function createManualAttachment(
  orgId: number,
  manualId: number,
  userId: number,
  fields: { originalFilename: string; fileSize: number }
): Promise<number> {
  const [result] = await db.execute(
    `INSERT INTO manual_attachments (manual_id, org_id, file_path, original_filename, file_size, uploaded_by)
     VALUES (?, ?, '', ?, ?, ?)`,
    [manualId, orgId, fields.originalFilename, fields.fileSize, userId]
  );
  return (result as ResultSetHeader).insertId;
}

export async function setManualAttachmentFilePath(attachmentId: number, filePath: string): Promise<void> {
  await db.execute("UPDATE manual_attachments SET file_path = ? WHERE id = ?", [filePath, attachmentId]);
}

export async function deleteManualAttachment(orgId: number, attachmentId: number): Promise<void> {
  await db.execute("DELETE FROM manual_attachments WHERE id = ? AND org_id = ?", [attachmentId, orgId]);
}
