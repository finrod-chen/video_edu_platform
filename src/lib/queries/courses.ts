import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface FolderRow extends RowDataPacket {
  id: number;
  name: string;
}

interface CourseRow extends RowDataPacket {
  id: number;
  title: string;
}

export async function getCourseFolders(orgId: number, parentId: number | null = null) {
  const [rows] = await db.query(
    parentId === null
      ? "SELECT id, name FROM course_folders WHERE org_id = ? AND parent_id IS NULL ORDER BY name ASC"
      : "SELECT id, name FROM course_folders WHERE org_id = ? AND parent_id = ? ORDER BY name ASC",
    parentId === null ? [orgId] : [orgId, parentId]
  );
  return (rows as FolderRow[]).map((r) => ({ id: String(r.id), name: r.name }));
}

export async function getCourses(orgId: number) {
  const [rows] = await db.query(
    "SELECT id, title FROM courses WHERE org_id = ? ORDER BY title ASC",
    [orgId]
  );
  return (rows as CourseRow[]).map((r) => ({ id: String(r.id), title: r.title }));
}
