import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { TebikiCourse, TebikiCourseFolder, TebikiCourseManual } from "@/types/tebiki";

interface FolderRow extends RowDataPacket {
  id: number;
  name: string;
  parent_id: number | null;
}

interface CourseRow extends RowDataPacket {
  id: number;
  title: string;
  folder_id: number | null;
}

export async function getCourseFolders(orgId: number, parentId: number | null = null) {
  const [rows] = await db.query(
    parentId === null
      ? "SELECT id, name, parent_id FROM course_folders WHERE org_id = ? AND parent_id IS NULL ORDER BY name ASC"
      : "SELECT id, name, parent_id FROM course_folders WHERE org_id = ? AND parent_id = ? ORDER BY name ASC",
    parentId === null ? [orgId] : [orgId, parentId]
  );
  return (rows as FolderRow[]).map(
    (r): TebikiCourseFolder => ({
      id: String(r.id),
      name: r.name,
      parentId: r.parent_id === null ? null : String(r.parent_id),
    })
  );
}

export async function getCourses(orgId: number) {
  const [rows] = await db.query(
    "SELECT id, title, folder_id FROM courses WHERE org_id = ? ORDER BY title ASC",
    [orgId]
  );
  return (rows as CourseRow[]).map(
    (r): TebikiCourse => ({
      id: String(r.id),
      title: r.title,
      folderId: r.folder_id === null ? null : String(r.folder_id),
    })
  );
}

export async function getCourseById(orgId: number, courseId: number): Promise<TebikiCourse | null> {
  const [rows] = await db.query(
    "SELECT id, title, folder_id FROM courses WHERE id = ? AND org_id = ?",
    [courseId, orgId]
  );
  const row = (rows as CourseRow[])[0];
  if (!row) return null;
  return { id: String(row.id), title: row.title, folderId: row.folder_id === null ? null : String(row.folder_id) };
}

export async function createCourseFolder(
  orgId: number,
  name: string,
  parentId: number | null = null
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO course_folders (org_id, parent_id, name) VALUES (?, ?, ?)",
    [orgId, parentId, name]
  );
  return (result as ResultSetHeader).insertId;
}

export async function renameCourseFolder(orgId: number, folderId: number, name: string): Promise<void> {
  await db.execute(
    "UPDATE course_folders SET name = ? WHERE id = ? AND org_id = ?",
    [name, folderId, orgId]
  );
}

export async function deleteCourseFolder(orgId: number, folderId: number): Promise<void> {
  await db.execute("DELETE FROM course_folders WHERE id = ? AND org_id = ?", [folderId, orgId]);
}

export async function createCourse(
  orgId: number,
  title: string,
  folderId: number | null = null
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO courses (org_id, folder_id, title) VALUES (?, ?, ?)",
    [orgId, folderId, title]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateCourse(
  orgId: number,
  courseId: number,
  fields: { title?: string; folderId?: number | null }
): Promise<void> {
  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  if (fields.title !== undefined) {
    sets.push("title = ?");
    params.push(fields.title);
  }
  if (fields.folderId !== undefined) {
    sets.push("folder_id = ?");
    params.push(fields.folderId);
  }
  if (sets.length === 0) return;
  params.push(courseId, orgId);
  await db.execute(`UPDATE courses SET ${sets.join(", ")} WHERE id = ? AND org_id = ?`, params);
}

export async function deleteCourse(orgId: number, courseId: number): Promise<void> {
  await db.execute("DELETE FROM courses WHERE id = ? AND org_id = ?", [courseId, orgId]);
}

interface CourseManualRow extends RowDataPacket {
  manual_id: number;
  title: string;
  position: number;
}

export async function getCourseManuals(courseId: number): Promise<TebikiCourseManual[]> {
  const [rows] = await db.query(
    `SELECT cm.manual_id, m.title, cm.position
     FROM course_manuals cm
     JOIN manuals m ON m.id = cm.manual_id
     WHERE cm.course_id = ?
     ORDER BY cm.position ASC`,
    [courseId]
  );
  return (rows as CourseManualRow[]).map((r) => ({
    manualId: String(r.manual_id),
    title: r.title,
    position: r.position,
  }));
}

export async function addManualToCourse(courseId: number, manualId: number): Promise<void> {
  const [countRows] = await db.query(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM course_manuals WHERE course_id = ?",
    [courseId]
  );
  const nextPosition = (countRows as RowDataPacket[])[0].next_position as number;
  await db.execute(
    "INSERT IGNORE INTO course_manuals (course_id, manual_id, position) VALUES (?, ?, ?)",
    [courseId, manualId, nextPosition]
  );
}

export async function removeManualFromCourse(courseId: number, manualId: number): Promise<void> {
  await db.execute(
    "DELETE FROM course_manuals WHERE course_id = ? AND manual_id = ?",
    [courseId, manualId]
  );
}

export async function reorderCourseManuals(
  courseId: number,
  orderedManualIds: number[]
): Promise<void> {
  await Promise.all(
    orderedManualIds.map((manualId, index) =>
      db.execute(
        "UPDATE course_manuals SET position = ? WHERE course_id = ? AND manual_id = ?",
        [index, courseId, manualId]
      )
    )
  );
}
