import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { ManualStatus, TebikiCourse, TebikiCourseManual } from "@/types/tebiki";

interface CourseRow extends RowDataPacket {
  id: number;
  title: string;
  status: ManualStatus;
  has_been_published: number | boolean;
}

function mapCourse(r: CourseRow): TebikiCourse {
  return {
    id: String(r.id),
    title: r.title,
    status: r.status,
    hasBeenPublished: Boolean(r.has_been_published),
  };
}

/** 課程是獨立的教學組合概念（可彙整多本手冊），不屬於任何資料夾。 */
export async function getCourses(orgId: number, statuses?: ManualStatus[]): Promise<TebikiCourse[]> {
  const params: (string | number)[] = [orgId];
  let statusClause = "";
  if (statuses && statuses.length > 0) {
    statusClause = ` AND status IN (${statuses.map(() => "?").join(",")})`;
    params.push(...statuses);
  }
  const [rows] = await db.query(
    `SELECT id, title, status, has_been_published FROM courses WHERE org_id = ?${statusClause} ORDER BY title ASC`,
    params
  );
  return (rows as CourseRow[]).map(mapCourse);
}

export async function getCourseById(orgId: number, courseId: number): Promise<TebikiCourse | null> {
  const [rows] = await db.query(
    "SELECT id, title, status, has_been_published FROM courses WHERE id = ? AND org_id = ?",
    [courseId, orgId]
  );
  const row = (rows as CourseRow[])[0];
  return row ? mapCourse(row) : null;
}

export async function createCourse(orgId: number, userId: number, title: string): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO courses (org_id, title, status, updated_by) VALUES (?, ?, 'draft', ?)",
    [orgId, title, userId]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateCourse(
  orgId: number,
  courseId: number,
  userId: number,
  fields: { title?: string; status?: ManualStatus }
): Promise<void> {
  const sets: string[] = [];
  const params: (string | number)[] = [];
  if (fields.title !== undefined) {
    sets.push("title = ?");
    params.push(fields.title);
  }
  if (fields.status !== undefined) {
    sets.push("status = ?");
    params.push(fields.status);
    if (fields.status === "published") {
      sets.push("has_been_published = TRUE");
    }
  }
  if (sets.length === 0) return;
  sets.push("updated_by = ?");
  params.push(userId, courseId, orgId);
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
