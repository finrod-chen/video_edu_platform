import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { Folder } from "@/types/models";

interface FolderRow extends RowDataPacket {
  id: number;
  name: string;
  parent_id: number | null;
}

function mapFolder(r: FolderRow): Folder {
  return {
    id: String(r.id),
    name: r.name,
    parentId: r.parent_id === null ? null : String(r.parent_id),
  };
}

/** Folders organize manuals (資料夾 > 手冊). `parentId` is reserved for future nested-folder browsing -- not surfaced in the UI yet. */
export async function getFolders(orgId: number, parentId: number | null = null): Promise<Folder[]> {
  const [rows] = await db.query(
    parentId === null
      ? "SELECT id, name, parent_id FROM folders WHERE org_id = ? AND parent_id IS NULL ORDER BY name ASC"
      : "SELECT id, name, parent_id FROM folders WHERE org_id = ? AND parent_id = ? ORDER BY name ASC",
    parentId === null ? [orgId] : [orgId, parentId]
  );
  return (rows as FolderRow[]).map(mapFolder);
}

export async function createFolder(orgId: number, name: string, parentId: number | null = null): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO folders (org_id, parent_id, name) VALUES (?, ?, ?)",
    [orgId, parentId, name]
  );
  return (result as ResultSetHeader).insertId;
}

export async function renameFolder(orgId: number, folderId: number, name: string): Promise<void> {
  await db.execute("UPDATE folders SET name = ? WHERE id = ? AND org_id = ?", [name, folderId, orgId]);
}

export async function deleteFolder(orgId: number, folderId: number): Promise<void> {
  await db.execute("DELETE FROM folders WHERE id = ? AND org_id = ?", [folderId, orgId]);
}
